const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const { successResponse, errorResponse } = require("../utils/apiResponse");

// ======================= CREATE BUS =======================
exports.createBus = async (req, res) => {
  try {
    const {
      licensePlate,
      routePermitNumber,
      busType,
      category,
      imageUrl,
      routeId,
      seatCount,
      seatLayout
    } = req.body;

    // 1. FIND OWNER PROFILE
    const owner = await prisma.owner.findUnique({
      where: {
        userId: req.user.id
      }
    });

    if (!owner) {
      return errorResponse(res, "Owner profile not found", 404);
    }

    // 2. CREATE BUS
    const bus = await prisma.bus.create({
      data: {
        licensePlate,
        routePermitNumber,
        busType,
        category,
        imageUrl,
        routeId,
        seatCount: Number(seatCount),
        seatLayout,
        ownerId: owner.id
      }
    });

    // 3. AUTO GENERATE SEATS
    const seatData = Array.from(
      { length: seatCount },
      (_, i) => ({
        seatNumber: `S${i + 1}`,
        busId: bus.id,
        status: "AVAILABLE"
      })
    );

    await prisma.seat.createMany({
      data: seatData
    });

    return successResponse(
      res,
      "Bus created successfully with seats",
      bus,
      201
    );

  } catch (err) {
    return errorResponse(res, err.message);
  }
};

// ======================= GET BUSES =======================
exports.getBuses = async (req, res) => {
  try {
    let buses;

    // ADMIN: SEE ALL
    if (req.user.role === "admin") {
      buses = await prisma.bus.findMany({
        include: {
          drivers: true,
          conductors: true,
          route: true,
          owner: true,
          seats: true
        }
      });
    }

    // OWNER: SEE OWN BUSES ONLY
    else if (req.user.role === "owner") {

      const owner = await prisma.owner.findUnique({
        where: {
          userId: req.user.id
        }
      });

      if (!owner) {
        return errorResponse(res, "Owner profile not found", 404);
      }

      buses = await prisma.bus.findMany({
        where: {
          ownerId: owner.id
        },
        include: {
          drivers: true,
          conductors: true,
          route: true,
          seats: true
        }
      });
    }

    // OTHER USERS (OPTIONAL)
    else {
      buses = await prisma.bus.findMany({
        include: {
          route: true,
          seats: true
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

// ======================= GET SINGLE BUS =======================
exports.getBusById = async (req, res) => {
  try {
    const { id } = req.params;

    const bus = await prisma.bus.findUnique({
      where: {
        id: parseInt(id)
      },
      include: {
        drivers: true,
        conductors: true,
        route: true,
        owner: true,
        seats: true
      }
    });

    if (!bus) {
      return errorResponse(res, "Bus not found", 404);
    }

    return successResponse(
      res,
      "Bus fetched successfully",
      bus
    );

  } catch (err) {
    return errorResponse(res, err.message);
  }
};

// ======================= DELETE BUS =======================
exports.deleteBus = async (req, res) => {
  try {
    const { id } = req.params;

    // delete seats first
    await prisma.seat.deleteMany({
      where: {
        busId: parseInt(id)
      }
    });

    await prisma.bus.delete({
      where: {
        id: parseInt(id)
      }
    });

    return successResponse(
      res,
      "Bus deleted successfully"
    );

  } catch (err) {
    return errorResponse(res, err.message);
  }
};