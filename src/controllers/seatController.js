const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const { getIO } = require("../sockets/socket");

// ================= GET ALL SEATS OF A BUS =================
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

// ================= LOCK SEAT =================
exports.lockSeat = async (req, res) => {
  try {
    const { seatId } = req.body;

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }

    const seat = await prisma.seat.findUnique({
      where: {
        id: seatId
      }
    });

    if (!seat) {
      return res.status(404).json({
        success: false,
        message: "Seat not found"
      });
    }

    if (seat.status === "BOOKED") {
      return res.status(400).json({
        success: false,
        message: "Seat already booked"
      });
    }

    if (seat.status === "LOCKED") {
      return res.status(400).json({
        success: false,
        message: "Seat currently locked"
      });
    }

    const updatedSeat = await prisma.seat.update({
      where: {
        id: seatId
      },
      data: {
        status: "LOCKED",
        lockedBy: req.user.id,
        lockedAt: new Date()
      }
    });

    getIO().emit("seatLocked", {
      seatId: updatedSeat.id,
      status: "LOCKED"
    });

    res.json({
      success: true,
      data: updatedSeat
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// ================= UNLOCK SEAT MANUALLY =================
exports.unlockSeat = async (req, res) => {
  try {
    const { seatId } = req.body;

    const updatedSeat = await prisma.seat.update({
      where: {
        id: seatId
      },
      data: {
        status: "AVAILABLE",
        lockedBy: null,
        lockedAt: null
      }
    });

    getIO().emit("seatUnlocked", {
      seatId: updatedSeat.id
    });

    res.json({
      success: true,
      data: updatedSeat
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// ================= AUTO UNLOCK EXPIRED SEATS =================
exports.unlockExpiredSeats = async () => {
  try {
    const fiveMinutesAgo = new Date(
      Date.now() - 5 * 60 * 1000
    );

    const expiredSeats = await prisma.seat.findMany({
      where: {
        status: "LOCKED",
        lockedAt: {
          lt: fiveMinutesAgo
        }
      }
    });

    for (const seat of expiredSeats) {
      await prisma.seat.update({
        where: {
          id: seat.id
        },
        data: {
          status: "AVAILABLE",
          lockedBy: null,
          lockedAt: null
        }
      });

      getIO().emit("seatUnlocked", {
        seatId: seat.id
      });
    }

    return expiredSeats.length;

  } catch (err) {
    console.error("Error unlocking expired seats:", err);
    return 0;
  }
};