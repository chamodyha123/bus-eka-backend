const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { getIO } = require("../sockets/socket");

// ================= GET SEATS BY TRIP (OR AUTO-GENERATE IF MISSING) =================
exports.getTripSeats = async (req, res) => {
  try {
    const tripId = Number(req.params.tripId);
    if (isNaN(tripId)) {
      return res.status(400).json({ success: false, message: "Invalid trip ID" });
    }

    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
      include: { bus: true }
    });

    if (!trip) {
      return res.status(404).json({ success: false, message: "Trip not found" });
    }

    // Auto-unlock any expired seats (5 minute lock expiry)
    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000);
    await prisma.seat.updateMany({
      where: {
        tripId,
        status: "LOCKED",
        lockedAt: { lt: fiveMinAgo }
      },
      data: {
        status: "AVAILABLE",
        lockedBy: null,
        lockedAt: null
      }
    });

    let seats = await prisma.seat.findMany({
      where: { tripId },
      orderBy: { id: "asc" }
    });

    // Auto-generate trip seats if not already created
    if (seats.length === 0 && trip.bus?.seatCount) {
      const seatsData = [];
      for (let i = 1; i <= trip.bus.seatCount; i++) {
        seatsData.push({
          seatNumber: `S${i}`,
          status: "AVAILABLE",
          busId: trip.busId,
          tripId
        });
      }
      await prisma.seat.createMany({ data: seatsData });

      seats = await prisma.seat.findMany({
        where: { tripId },
        orderBy: { id: "asc" }
      });
    }

    return res.json({
      success: true,
      data: seats
    });
  } catch (err) {
    console.error("getTripSeats error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ================= GET SEATS BY BUS (FALLBACK) =================
exports.getBusSeats = async (req, res) => {
  try {
    const busId = Number(req.params.busId);
    if (isNaN(busId)) {
      return res.status(400).json({ success: false, message: "Invalid bus ID" });
    }

    const seats = await prisma.seat.findMany({
      where: { busId },
      orderBy: { id: "asc" }
    });

    return res.json({
      success: true,
      data: seats
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ================= LOCK SEAT =================
exports.lockSeat = async (req, res) => {
  try {
    const { seatId } = req.body;

    const seat = await prisma.seat.findUnique({
      where: { id: Number(seatId) }
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
        message: "Seat is already booked"
      });
    }

    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000);

    if (seat.status === "LOCKED") {
      const isExpired = seat.lockedAt && new Date(seat.lockedAt) < fiveMinAgo;

      if (!isExpired) {
        if (seat.lockedBy === req.user.id) {
          return res.json({ success: true, data: seat });
        }
        return res.status(400).json({
          success: false,
          message: "Seat is locked by another passenger"
        });
      }
    }

    const updatedSeat = await prisma.seat.update({
      where: { id: Number(seatId) },
      data: {
        status: "LOCKED",
        lockedBy: req.user.id,
        lockedAt: new Date()
      }
    });

    try {
      getIO().emit("seatLocked", {
        seatId: updatedSeat.id,
        busId: updatedSeat.busId,
        tripId: updatedSeat.tripId,
        status: "LOCKED"
      });
    } catch (e) {
      console.warn("Socket notification skipped:", e.message);
    }

    return res.json({
      success: true,
      data: updatedSeat
    });

  } catch (err) {
    return res.status(500).json({
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
      where: { id: Number(seatId) },
      data: {
        status: "AVAILABLE",
        lockedBy: null,
        lockedAt: null
      }
    });

    try {
      getIO().emit("seatUnlocked", {
        seatId: updatedSeat.id,
        tripId: updatedSeat.tripId
      });
    } catch (e) {
      console.warn("Socket notification skipped:", e.message);
    }

    return res.json({
      success: true,
      data: updatedSeat
    });

  } catch (err) {
    return res.status(500).json({
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

      try {
        getIO().emit("seatUnlocked", {
          seatId: seat.id,
          tripId: seat.tripId
        });
      } catch (e) {}
    }

    return expiredSeats.length;

  } catch (err) {
    console.error("unlockExpiredSeats error:", err.message);
    return 0;
  }
};