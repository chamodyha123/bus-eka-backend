const crypto = require("crypto");
const QRCode = require("qrcode");
const { v4: uuidv4 } = require("uuid");

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

exports.payhereNotify = async (req, res) => {
  try {

    const {
      order_id,
      payment_id,
      status_code
    } = req.body;

    const bookingId = parseInt(
      order_id.replace("BOOK_", "")
    );

    // SUCCESS PAYMENT
    if (status_code === "2") {

      const booking = await prisma.booking.findUnique({
        where: {
          id: bookingId
        },
        include: {
          user: true
        }
      });

      if (!booking) {
        return res.status(404).send("Booking not found");
      }

      // GENERATE UNIQUE TICKET ID
      const ticketId = uuidv4();

      // GENERATE QR IMAGE
      const qrImage = await QRCode.toDataURL(ticketId);

      // UPDATE BOOKING
      await prisma.booking.update({
        where: {
          id: bookingId
        },
        data: {
          paymentStatus: "PAID",
          status: "CONFIRMED",
          paymentId: payment_id,
          qrCode: ticketId
        }
      });

      console.log("QR Ticket Generated");
      console.log(ticketId);
    }

    return res.send("OK");

  } catch (err) {

    console.error(err);

    return res.status(500).send("ERROR");
  }
};