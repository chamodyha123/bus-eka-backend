const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const { successResponse, errorResponse } = require("../utils/apiResponse");

// CREATE DRIVER (AUTO ASSIGN BUS)
exports.createDriver = async (req, res) => {
  try {

    const {
      name,
      phoneNumber,
      licenseNumber,
      busId
    } = req.body;

    // CHECK BUS EXISTS
    const bus = await prisma.bus.findUnique({
      where: { id: busId }
    });

    if (!bus) {
      return errorResponse(res, "Bus not found", 404);
    }

    const driver = await prisma.driver.create({
      data: {
        name,
        phoneNumber,
        licenseNumber,
        busId: busId
      }
    });

    return successResponse(
      res,
      "Driver created and assigned to bus successfully",
      driver,
      201
    );

  } catch (err) {
    return errorResponse(res, err.message);
  }
};