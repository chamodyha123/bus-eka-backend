const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const { getIO } = require("../sockets/socket");

// TRACKING PRIORITY
const trackingPriority = {
  GPS_DEVICE: 1,
  DRIVER: 2,
  CONDUCTOR: 3,
  PASSENGER: 4
};

// UPDATE LOCATION
exports.updateLocation = async (req, res) => {
  try {

    const {
      busId,
      latitude,
      longitude,
      trackingSource,
      userId
    } = req.body;

    // VALID SOURCES
    const validSources = [
      "GPS_DEVICE",
      "DRIVER",
      "CONDUCTOR",
      "PASSENGER"
    ];

    if (!validSources.includes(trackingSource)) {
      return res.status(400).json({
        success: false,
        message: "Invalid tracking source"
      });
    }

    // CREATE GPS LOG
    const gpsLog = await prisma.gPSLog.create({
      data: {
        busId,
        latitude,
        longitude,
        trackingSource,
        userId
      }
    });

    // GET LATEST TRACKING SOURCES
    const latestLogs = await prisma.gPSLog.findMany({
      where: {
        busId
      },
      orderBy: {
        createdAt: "desc"
      },
      take: 20
    });

    // FIND HIGHEST PRIORITY SOURCE
    let bestLog = latestLogs[0];

    latestLogs.forEach((log) => {
      if (
        trackingPriority[log.trackingSource] <
        trackingPriority[bestLog.trackingSource]
      ) {
        bestLog = log;
      }
    });

    // REAL-TIME UPDATE
    const io = getIO();

    io.emit("busLocationUpdated", {
      busId,
      latitude: bestLog.latitude,
      longitude: bestLog.longitude,
      trackingSource: bestLog.trackingSource
    });

    res.status(201).json({
      success: true,
      message: "Location updated",
      data: gpsLog
    });

  } catch (err) {

    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// GET BEST CURRENT LOCATION
exports.getLatestLocation = async (req, res) => {
  try {

    const { busId } = req.params;

    const logs = await prisma.gPSLog.findMany({
      where: {
        busId: parseInt(busId)
      },
      orderBy: {
        createdAt: "desc"
      },
      take: 20
    });

    if (!logs.length) {
      return res.status(404).json({
        success: false,
        message: "No location found"
      });
    }

    let bestLog = logs[0];

    logs.forEach((log) => {
      if (
        trackingPriority[log.trackingSource] <
        trackingPriority[bestLog.trackingSource]
      ) {
        bestLog = log;
      }
    });

    res.json({
      success: true,
      data: bestLog
    });

  } catch (err) {

    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};