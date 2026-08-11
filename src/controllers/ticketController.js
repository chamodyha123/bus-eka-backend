const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// VERIFY & SCAN TICKET
exports.verifyTicket = async (req, res) => {
  try {
    const { qrCode } = req.body;
    if (!qrCode || !String(qrCode).trim()) {
      return res.status(400).json({
        success: false,
        message: "QR Code or Ticket Code is required"
      });
    }

    const cleanCode = String(qrCode).trim();

    // Find booking by qrCode string or numeric booking ID
    let booking = await prisma.booking.findFirst({
      where: {
        OR: [
          { qrCode: cleanCode },
          { id: !isNaN(Number(cleanCode)) ? Number(cleanCode) : -1 }
        ]
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
        seats: true,
        trip: {
          include: {
            bus: true,
            route: true
          }
        }
      }
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Invalid Ticket — No matching booking found"
      });
    }

    if (booking.paymentStatus !== "PAID") {
      return res.status(400).json({
        success: false,
        message: "Unpaid Ticket — Payment is still pending",
        booking
      });
    }

    if (booking.isUsed) {
      return res.status(400).json({
        success: false,
        message: "Ticket Already Used — Passenger has already boarded",
        booking
      });
    }

    // Mark ticket as used
    const updatedBooking = await prisma.booking.update({
      where: { id: booking.id },
      data: { isUsed: true }
    });

    return res.json({
      success: true,
      message: "Ticket Verified Successfully — Boarding Approved",
      data: {
        bookingId: booking.id,
        passengerName: booking.user?.name,
        seats: booking.seats.map((s) => s.seatNumber),
        trip: `${booking.trip?.departureCity} → ${booking.trip?.arrivalCity}`,
        bus: booking.trip?.bus?.licensePlate,
        departureTime: booking.trip?.departureTime,
        status: updatedBooking.status,
        isUsed: updatedBooking.isUsed
      }
    });

  } catch (err) {
    console.error("verifyTicket error:", err);
    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};