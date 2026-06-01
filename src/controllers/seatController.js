const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

exports.getBusSeats = async (req, res) => {
  try {

    const { busId } = req.params;

    const seats = await prisma.seat.findMany({
      where: {
        busId: parseInt(busId)
      },
      orderBy: {
        seatNumber: "asc"
      }
    });

    res.json({
      success: true,
      data: seats
    });

  } catch (err) {

    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};