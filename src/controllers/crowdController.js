const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const { getIO } = require("../sockets/socket");

// CREATE CROWD REPORT
exports.reportCrowd = async (req, res) => {
  try {
    const { busId, userId, crowdLevel } = req.body;

    const report = await prisma.crowdReport.create({
      data: {
        busId,
        userId,
        crowdLevel
      }
    });

    // REAL-TIME UPDATE
    const io = getIO();

    io.emit("crowdUpdated", {
      busId,
      crowdLevel
    });

    res.status(201).json(report);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET BUS CROWD STATUS
exports.getBusCrowd = async (req, res) => {
  try {
    const { busId } = req.params;

    const reports = await prisma.crowdReport.findMany({
      where: {
        busId: parseInt(busId)
      },
      orderBy: {
        createdAt: "desc"
      },
      take: 10
    });

    res.json(reports);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};