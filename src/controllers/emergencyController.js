const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const { getIO } = require("../sockets/socket");

// CREATE EMERGENCY REPORT
exports.createEmergency = async (req, res) => {
  try {
    const {
      emergencyType,
      description,
      latitude,
      longitude,
      userId,
      busId
    } = req.body;

    const emergency = await prisma.emergencyReport.create({
      data: {
        emergencyType,
        description,
        latitude,
        longitude,
        userId,
        busId
      }
    });

    // REAL-TIME BROADCAST
    const io = getIO();

    io.emit("emergencyAlert", emergency);

    res.status(201).json(emergency);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET ALL EMERGENCIES
exports.getEmergencies = async (req, res) => {
  try {
    const emergencies = await prisma.emergencyReport.findMany({
      include: {
        user: true,
        bus: true
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    res.json(emergencies);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};