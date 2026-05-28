const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const {
  successResponse,
  errorResponse
} = require("../utils/apiResponse");

// CREATE BUS
exports.createBus = async (req, res) => {
  try {
    const {
      licensePlate,
      routePermitNumber,
      busType,
      category,
      imageUrl,
      routeId
    } = req.body;

    const bus = await prisma.bus.create({
      data: {
        licensePlate,
        routePermitNumber,
        busType,
        category,
        imageUrl,

        ownerId: req.user.id,

        routeId: routeId || null
      }
    });

    return successResponse(
      res,
      "Bus created successfully",
      bus,
      201
    );

  } catch (err) {
    return errorResponse(res, err.message);
  }
};

// GET BUSES
exports.getBuses = async (req, res) => {
  try {
    let buses;

    if (req.user.role === "admin") {
      buses = await prisma.bus.findMany({
        include: {
          drivers: true,
          route: true,
          owner: true
        }
      });
    } else {
      buses = await prisma.bus.findMany({
        where: {
          ownerId: req.user.id
        },
        include: {
          drivers: true,
          route: true
        }
      });
    }

    return successResponse(
      res,
      "Buses fetched successfully",
      buses
    );

  } catch (err) {
    return errorResponse(res, err.message);
  }
};