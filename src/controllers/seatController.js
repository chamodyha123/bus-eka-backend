const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { getIO } = require("../sockets/socket");

// ================= GET SEATS =================
exports.getBusSeats = async (req, res) => {
  try {
    const { busId } = req.params;

    const seats = await prisma.seat.findMany({
      where: { busId: parseInt(busId) },
      orderBy: { seatNumber: "asc" }
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

    const seat = await prisma.seat.findUnique({
      where: { id: seatId }
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
        message: "Seat already locked"
      });
    }

    const updatedSeat = await prisma.seat.update({
      where: { id: seatId },
      data: {
        status: "LOCKED",
        lockedBy: req.user.id,
        lockedAt: new Date()
      }
    });

    getIO().emit("seatLocked", {
      seatId: updatedSeat.id,
      busId: updatedSeat.busId,
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

// ================= UNLOCK SEAT =================
exports.unlockSeat = async (req, res) => {
  try {
    const { seatId } = req.body;

    const updatedSeat = await prisma.seat.update({
      where: { id: seatId },
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

// ================= AUTO CLEANUP EXPIRED LOCKS =================
exports.unlockExpiredSeats = async () => {
  try {
    const expiryTime = new Date(Date.now() - 5 * 60 * 1000);

    const expiredSeats = await prisma.seat.findMany({
      where: {
        status: "LOCKED",
        lockedAt: { lt: expiryTime }
      }
    });

    for (const seat of expiredSeats) {
      await prisma.seat.update({
        where: { id: seat.id },
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
    console.error("unlockExpiredSeats error:", err.message);
    return 0;
  }
};