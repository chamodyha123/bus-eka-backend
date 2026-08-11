const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { successResponse, errorResponse } = require("../utils/apiResponse");

// GET ALL DRIVERS
exports.getDrivers = async (req, res) => {
  try {
    const drivers = await prisma.driver.findMany({
      include: {
        user: { select: { id: true, name: true, email: true, role: true } },
        bus: true
      }
    });

    return successResponse(res, "Drivers fetched successfully", drivers);
  } catch (err) {
    return errorResponse(res, err.message);
  }
};

// CREATE / ASSIGN DRIVER
exports.createDriver = async (req, res) => {
  try {
    const { userId, licenseNumber, phoneNumber, busId } = req.body;

    if (!userId || !licenseNumber) {
      return errorResponse(res, "User ID and License Number are required", 400);
    }

    if (busId) {
      const bus = await prisma.bus.findUnique({
        where: { id: Number(busId) }
      });
      if (!bus) {
        return errorResponse(res, "Bus not found", 404);
      }
    }

    const driver = await prisma.driver.upsert({
      where: { userId: Number(userId) },
      update: {
        licenseNumber,
        phoneNumber: phoneNumber || null,
        busId: busId ? Number(busId) : null
      },
      create: {
        userId: Number(userId),
        licenseNumber,
        phoneNumber: phoneNumber || null,
        busId: busId ? Number(busId) : null
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
        bus: true
      }
    });

    return successResponse(
      res,
      "Driver profile updated and assigned to bus successfully",
      driver,
      201
    );

  } catch (err) {
    return errorResponse(res, err.message);
  }
};