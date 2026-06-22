const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// ================= CREATE EMERGENCY REPORT =================
exports.createEmergencyReport = async (req, res) => {
  try {
    const {
      licensePlate,
      emergencyType,
      description,
      latitude,
      longitude,
      userId
    } = req.body;

    // Validation
    if (!licensePlate || !emergencyType || !description) {
      return res.status(400).json({
        success: false,
        message: "License plate, emergency type and description are required"
      });
    }

    // Find bus by license plate
    const bus = await prisma.bus.findFirst({
      where: {
        licensePlate: licensePlate.trim()
      }
    });

    if (!bus) {
      return res.status(404).json({
        success: false,
        message: "Bus not found with this license plate"
      });
    }

    const emergency = await prisma.emergencyReport.create({
      data: {
        emergencyType,
        description,
        latitude: latitude !== null && latitude !== undefined ? Number(latitude) : null,
        longitude: longitude !== null && longitude !== undefined ? Number(longitude) : null,
        userId: userId ? Number(userId) : null,
        busId: bus.id
      }
    });

    return res.status(201).json({
      success: true,
      message: "Emergency report submitted successfully",
      data: emergency
    });

  } catch (err) {
    console.error("Emergency create error:", err);
    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// ================= GET ALL EMERGENCY REPORTS =================
exports.getEmergencyReports = async (req, res) => {
  try {
    const reports = await prisma.emergencyReport.findMany({
      include: {
        bus: true,
        user: true
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    return res.status(200).json({
      success: true,
      data: reports
    });
  } catch (err) {
    console.error("Get emergency reports error:", err);
    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};