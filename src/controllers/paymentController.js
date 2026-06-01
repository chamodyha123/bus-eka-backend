const crypto = require("crypto");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// ================= CREATE PAYHERE PAYMENT =================
exports.createPayment = async (req, res) => {
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

    // HASH (PayHere requirement)
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
      sandbox: true, // set false in production
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

      hash: hash
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
exports.payhereNotify = async (req, res) => {
  try {
    const {
      order_id,
      payment_id,
      status_code
    } = req.body;

    const bookingId = parseInt(order_id.replace("BOOK_", ""));

    // SUCCESS = 2
    if (status_code === "2") {
      await prisma.booking.update({
        where: { id: bookingId },
        data: {
          paymentStatus: "PAID",
          status: "CONFIRMED",
          paymentId: payment_id
        }
      });
    }

    return res.send("OK");

  } catch (err) {
    return res.status(500).send("ERROR");
  }
};