const crypto = require("crypto");
const QRCode = require("qrcode");
const { v4: uuidv4 } = require("uuid");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

// ================= CREATE PAYMENT =================
const createPayment = async (req, res) => {
  try {
    const { bookingId } = req.body;

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { user: true }
    });

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const merchantId = process.env.PAYHERE_MERCHANT_ID;
    const secret = process.env.PAYHERE_SECRET;

    const orderId = `BOOK_${booking.id}`;

    const hash = crypto
      .createHash("md5")
      .update(
        merchantId +
        orderId +
        booking.totalAmount +
        process.env.PAYHERE_CURRENCY +
        crypto.createHash("md5").update(secret).digest("hex").toUpperCase()
      )
      .digest("hex")
      .toUpperCase();

    const paymentData = {
      sandbox: true,
      merchant_id: merchantId,
      return_url: process.env.PAYHERE_RETURN_URL,
      cancel_url: process.env.PAYHERE_CANCEL_URL,
      notify_url: process.env.PAYHERE_NOTIFY_URL,

      order_id: orderId,
      items: "Bus Ticket Booking",
      currency: process.env.PAYHERE_CURRENCY,
      amount: booking.totalAmount,

      first_name: booking.user.name,
      email: booking.user.email,
      phone: "0700000000",

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

// ================= PAYHERE NOTIFY =================
const payhereNotify = async (req, res) => {
  try {
    const { order_id, payment_id, status_code } = req.body;

    const bookingId = parseInt(order_id.replace("BOOK_", ""));

    if (status_code === "2") {
      const booking = await prisma.booking.findUnique({
        where: { id: bookingId }
      });

      if (!booking) {
        return res.status(404).send("Booking not found");
      }

      const ticketId = uuidv4();

      const qrImage = await QRCode.toDataURL(ticketId);

      await prisma.booking.update({
        where: { id: bookingId },
        data: {
          paymentStatus: "PAID",
          status: "CONFIRMED",
          paymentId,
          qrCode: ticketId
        }
      });

      console.log("QR GENERATED:", qrImage);
    }

    return res.send("OK");

  } catch (err) {
    console.error(err);
    return res.status(500).send("ERROR");
  }
};

// ✅ IMPORTANT EXPORT FIX
module.exports = {
  createPayment,
  payhereNotify
};