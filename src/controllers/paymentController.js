const crypto = require("crypto");
const QRCode = require("qrcode");
const { v4: uuidv4 } = require("uuid");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

// ================= CREATE PAYMENT (PAYHERE PAYLOAD) =================
const createPayment = async (req, res) => {
  try {
    const { bookingId } = req.body;

    const booking = await prisma.booking.findUnique({
      where: { id: Number(bookingId) },
      include: { user: true }
    });

    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    const merchantId = process.env.PAYHERE_MERCHANT_ID || "1220000";
    const secret = process.env.PAYHERE_SECRET || "456789";

    const orderId = `BOOK_${booking.id}`;
    const currency = process.env.PAYHERE_CURRENCY || "LKR";

    const hash = crypto
      .createHash("md5")
      .update(
        merchantId +
        orderId +
        booking.totalAmount +
        currency +
        crypto.createHash("md5").update(secret).digest("hex").toUpperCase()
      )
      .digest("hex")
      .toUpperCase();

    const paymentData = {
      sandbox: true,
      merchant_id: merchantId,
      return_url: process.env.PAYHERE_RETURN_URL || "http://localhost:3000/dashboard/passenger/booking/success/" + booking.id,
      cancel_url: process.env.PAYHERE_CANCEL_URL || "http://localhost:3000/dashboard/passenger/booking",
      notify_url: process.env.PAYHERE_NOTIFY_URL || "http://localhost:5000/api/payment/notify",

      order_id: orderId,
      items: `Bus Ticket Booking #${booking.id}`,
      currency,
      amount: booking.totalAmount,

      first_name: booking.user.name,
      email: booking.user.email,
      phone: "0770000000",

      hash
    };

    return res.json({
      success: true,
      data: paymentData
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// ================= MOCK / DEMO PAYMENT INSTANT CONFIRMATION =================
const mockPayment = async (req, res) => {
  try {
    const { bookingId } = req.body;
    if (!bookingId) {
      return res.status(400).json({ success: false, message: "Booking ID is required" });
    }

    const booking = await prisma.booking.findUnique({
      where: { id: Number(bookingId) },
      include: { seats: true, trip: { include: { bus: true, route: true } } }
    });

    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    // Generate unique Ticket ID & QR
    const ticketId = booking.qrCode || `BE-${Date.now()}-${uuidv4().substring(0, 8).toUpperCase()}`;
    const qrDataUrl = await QRCode.toDataURL(ticketId);

    const updatedBooking = await prisma.booking.update({
      where: { id: Number(bookingId) },
      data: {
        paymentStatus: "PAID",
        status: "CONFIRMED",
        paymentId: `MOCK_PAY_${Date.now()}`,
        qrCode: ticketId
      },
      include: {
        seats: true,
        trip: {
          include: {
            bus: true,
            route: true
          }
        }
      }
    });

    return res.json({
      success: true,
      message: "Payment confirmed successfully (Demo Mode)",
      data: {
        booking: updatedBooking,
        ticketId,
        qrDataUrl
      }
    });

  } catch (err) {
    console.error("mockPayment error:", err);
    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// ================= PAYHERE NOTIFY WEBHOOK =================
const payhereNotify = async (req, res) => {
  try {
    const { order_id, payment_id, status_code } = req.body;

    if (!order_id) {
      return res.status(400).send("Missing order_id");
    }

    const bookingId = parseInt(order_id.replace("BOOK_", ""));

    if (status_code === "2") {
      const booking = await prisma.booking.findUnique({
        where: { id: bookingId }
      });

      if (!booking) {
        return res.status(404).send("Booking not found");
      }

      const ticketId = `BE-${Date.now()}-${uuidv4().substring(0, 8).toUpperCase()}`;

      await prisma.booking.update({
        where: { id: bookingId },
        data: {
          paymentStatus: "PAID",
          status: "CONFIRMED",
          paymentId: payment_id || `PAYHERE_${Date.now()}`,
          qrCode: ticketId
        }
      });
    }

    return res.send("OK");

  } catch (err) {
    console.error("payhereNotify error:", err);
    return res.status(500).send("ERROR");
  }
};

module.exports = {
  createPayment,
  mockPayment,
  payhereNotify
};