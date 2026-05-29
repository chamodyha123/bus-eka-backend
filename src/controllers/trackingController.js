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

    // ROLE VALIDATION
    const allowedRoles = [
      "driver",
      "conductor",
      "admin",
      "passenger"
    ];

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized role"
      });
    }

    const {
      busId,
      latitude,
      longitude,
      trackingSource
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

    // PASSENGER FALLBACK PROTECTION
    if (trackingSource === "PASSENGER") {

      const recentTrustedLog = await prisma.gPSLog.findFirst({
        where: {
          busId,
          trackingSource: {
            in: ["GPS_DEVICE", "DRIVER", "CONDUCTOR"]
          }
        },
        orderBy: {
          createdAt: "desc"
        }
      });

      if (recentTrustedLog) {

        const diff =
          new Date() - new Date(recentTrustedLog.createdAt);

        // 2 minutes
        if (diff < 120000) {

          return res.status(400).json({
            success: false,
            message:
              "Passenger tracking disabled while trusted tracking is active"
          });
        }
      }
    }

    // CREATE GPS LOG
    const gpsLog = await prisma.gPSLog.create({
      data: {
        busId,
        latitude,
        longitude,
        trackingSource,
        userId: req.user.id
      }
    });

    // GET RECENT LOGS
    const latestLogs = await prisma.gPSLog.findMany({
      where: {
        busId
      },
      orderBy: {
        createdAt: "desc"
      },
      take: 20
    });

    // FIND BEST LOG BASED ON PRIORITY
    let bestLog = latestLogs[0];

    latestLogs.forEach((log) => {

      if (
        trackingPriority[log.trackingSource] <
        trackingPriority[bestLog.trackingSource]
      ) {
        bestLog = log;
      }
    });

    // SOCKET.IO REAL-TIME UPDATE
    const io = getIO();

    io.to(`bus_${busId}`).emit("busLocationUpdated", {
      busId,
      latitude: bestLog.latitude,
      longitude: bestLog.longitude,
      trackingSource: bestLog.trackingSource
    });

    return res.status(201).json({
      success: true,
      message: "Location updated successfully",
      data: gpsLog
    });

  } catch (err) {

    return res.status(500).json({
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

    // FIND BEST TRACKING SOURCE
    let bestLog = logs[0];

    logs.forEach((log) => {

      if (
        trackingPriority[log.trackingSource] <
        trackingPriority[bestLog.trackingSource]
      ) {
        bestLog = log;
      }
    });

    return res.status(200).json({
      success: true,
      data: bestLog
    });

  } catch (err) {

    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};