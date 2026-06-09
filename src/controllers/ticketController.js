const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

exports.verifyTicket = async (req, res) => {

  try {

    const { qrCode } = req.body;

    const booking =
      await prisma.booking.findUnique({
        where: {
          qrCode
        },
        include: {
          user: true,
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
        message: "Invalid Ticket"
      });
    }

    if (booking.isUsed) {
      return res.status(400).json({
        success: false,
        message: "Ticket already used"
      });
    }

    await prisma.booking.update({
      where: {
        id: booking.id
      },
      data: {
        isUsed: true
      }
    });

    res.json({
      success: true,
      message: "Ticket Verified",
      passenger: booking.user.name,
      seat: booking.seats,
      route: booking.trip.route,
      bus: booking.trip.bus
    });

  } catch (err) {

    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};