const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const { getIO } = require("../sockets/socket");

// UPDATE GPS LOCATION
exports.updateLocation = async (req, res) => {
  try {
    const { busId, latitude, longitude } = req.body;

    const gpsLog = await prisma.gPSLog.create({
      data: {
        busId,
        latitude,
        longitude
      }
    });

    // SEND REAL-TIME UPDATE
    const io = getIO();

    io.emit("busLocationUpdated", {
      busId,
      latitude,
      longitude
    });

    res.status(201).json(gpsLog);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET LATEST LOCATION
exports.getLatestLocation = async (req, res) => {
  try {
    const { busId } = req.params;

    const location = await prisma.gPSLog.findFirst({
      where: {
        busId: parseInt(busId)
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    res.json(location);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};