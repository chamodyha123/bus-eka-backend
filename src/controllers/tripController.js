const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const { successResponse, errorResponse } = require("../utils/apiResponse");

// ======================================================
// HELPER: CREATE DAILY TRIP CODE
// Example: TRIP-12-20260622-1715000000000
// ======================================================
const generateTripCode = (busId, tripDate) => {
  const date = new Date(tripDate);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");

  return `TRIP-${busId}-${y}${m}${d}-${Date.now()}`;
};

// ======================================================
// CREATE TRIP
// owner/admin
// ======================================================
exports.createTrip = async (req, res) => {
  try {
    const {
      busId,
      routeId,
      tripDate,
      departureCity,
      arrivalCity,
      departureTime,
      arrivalTime,
      price,
    } = req.body;

    if (!busId) {
      return errorResponse(res, "Bus ID is required", 400);
    }

    if (!tripDate) {
      return errorResponse(res, "Trip date is required", 400);
    }

    if (!departureCity || !arrivalCity) {
      return errorResponse(
        res,
        "Departure city and arrival city are required",
        400
      );
    }

    if (!departureTime || !arrivalTime) {
      return errorResponse(
        res,
        "Departure time and arrival time are required",
        400
      );
    }

    // ================= FIND BUS =================
    const bus = await prisma.bus.findUnique({
      where: { id: parseInt(busId) },
      include: {
        owner: true,
        route: true,
      },
    });

    if (!bus) {
      return errorResponse(res, "Bus not found", 404);
    }

    // ================= OWNER SECURITY =================
    if (req.user.role === "owner") {
      const owner = await prisma.owner.findFirst({
        where: {
          userId: req.user.id,
        },
      });

      if (!owner) {
        return errorResponse(res, "Owner profile not found", 404);
      }

      if (bus.ownerId !== owner.id) {
        return errorResponse(
          res,
          "You can only create trips for your own buses",
          403
        );
      }
    }

    // ================= ROUTE CHECK =================
    let finalRouteId = null;

    if (routeId) {
      const route = await prisma.route.findUnique({
        where: { id: parseInt(routeId) },
      });

      if (!route) {
        return errorResponse(res, "Route not found", 404);
      }

      finalRouteId = route.id;
    } else if (bus.routeId) {
      finalRouteId = bus.routeId;
    }

    // ================= TRIP DATE =================
    const parsedTripDate = new Date(tripDate);

    if (isNaN(parsedTripDate.getTime())) {
      return errorResponse(res, "Invalid trip date", 400);
    }

    const tripCode = generateTripCode(bus.id, parsedTripDate);

    // ================= CREATE TRIP =================
    const trip = await prisma.trip.create({
      data: {
        tripCode,
        tripDate: parsedTripDate,
        busId: bus.id,
        routeId: finalRouteId,
        departureCity,
        arrivalCity,
        departureTime,
        arrivalTime,
        price: Number(price || 0),
        status: "ACTIVE",
        isActive: true,
      },
      include: {
        bus: true,
        route: true,
      },
    });

    return successResponse(res, "Trip created successfully", trip, 201);
  } catch (err) {
    console.error("createTrip error:", err);
    return errorResponse(res, err.message);
  }
};

// ======================================================
// GET ALL TRIPS
// admin -> all trips
// owner -> only owner's buses trips
// passenger -> all active trips
// ======================================================
exports.getTrips = async (req, res) => {
  try {
    let where = {};

    if (req.user.role === "owner") {
      const owner = await prisma.owner.findFirst({
        where: { userId: req.user.id },
      });

      if (!owner) {
        return errorResponse(res, "Owner profile not found", 404);
      }

      where = {
        bus: {
          ownerId: owner.id,
        },
      };
    }

    if (req.user.role === "passenger") {
      where = {
        isActive: true,
        status: "ACTIVE",
      };
    }

    const trips = await prisma.trip.findMany({
      where,
      include: {
        bus: true,
        route: true,
      },
      orderBy: [
        { tripDate: "asc" },
        { departureTime: "asc" },
      ],
    });

    return successResponse(res, "Trips fetched successfully", trips);
  } catch (err) {
    console.error("getTrips error:", err);
    return errorResponse(res, err.message);
  }
};

// ======================================================
// GET TRIPS BY BUS
// owner/admin/passenger
// ======================================================
exports.getTripsByBus = async (req, res) => {
  try {
    const { busId } = req.params;

    const bus = await prisma.bus.findUnique({
      where: { id: parseInt(busId) },
      include: {
        owner: true,
      },
    });

    if (!bus) {
      return errorResponse(res, "Bus not found", 404);
    }

    // owner can only view own bus trips
    if (req.user.role === "owner") {
      const owner = await prisma.owner.findFirst({
        where: { userId: req.user.id },
      });

      if (!owner) {
        return errorResponse(res, "Owner profile not found", 404);
      }

      if (bus.ownerId !== owner.id) {
        return errorResponse(
          res,
          "You can only view trips of your own buses",
          403
        );
      }
    }

    const where = {
      busId: parseInt(busId),
    };

    // passengers should only see active trips
    if (req.user.role === "passenger") {
      where.isActive = true;
      where.status = "ACTIVE";
    }

    const trips = await prisma.trip.findMany({
      where,
      include: {
        bus: true,
        route: true,
      },
      orderBy: [
        { tripDate: "asc" },
        { departureTime: "asc" },
      ],
    });

    return successResponse(res, "Trips fetched successfully", trips);
  } catch (err) {
    console.error("getTripsByBus error:", err);
    return errorResponse(res, err.message);
  }
};

// ======================================================
// GET SINGLE TRIP
// ======================================================
exports.getTripById = async (req, res) => {
  try {
    const { id } = req.params;

    const trip = await prisma.trip.findUnique({
      where: { id: parseInt(id) },
      include: {
        bus: true,
        route: true,
        bookings: {
          include: {
            user: true,
            seats: true,
          },
        },
      },
    });

    if (!trip) {
      return errorResponse(res, "Trip not found", 404);
    }

    // owner security
    if (req.user.role === "owner") {
      const owner = await prisma.owner.findFirst({
        where: { userId: req.user.id },
      });

      if (!owner) {
        return errorResponse(res, "Owner profile not found", 404);
      }

      const bus = await prisma.bus.findUnique({
        where: { id: trip.busId },
      });

      if (!bus || bus.ownerId !== owner.id) {
        return errorResponse(res, "Unauthorized access to trip", 403);
      }
    }

    return successResponse(res, "Trip fetched successfully", trip);
  } catch (err) {
    console.error("getTripById error:", err);
    return errorResponse(res, err.message);
  }
};

// ======================================================
// SEARCH TRIPS
// /api/trips/search?start=Colombo&end=Kandy&date=2026-06-22
// ======================================================
exports.searchTrips = async (req, res) => {
  try {
    const { start, end, date } = req.query;

    let where = {
      isActive: true,
      status: "ACTIVE",
    };

    if (start) {
      where.departureCity = {
        contains: start,
        mode: "insensitive",
      };
    }

    if (end) {
      where.arrivalCity = {
        contains: end,
        mode: "insensitive",
      };
    }

    if (date) {
      const selectedDate = new Date(date);

      if (isNaN(selectedDate.getTime())) {
        return errorResponse(res, "Invalid date", 400);
      }

      const startOfDay = new Date(selectedDate);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(selectedDate);
      endOfDay.setHours(23, 59, 59, 999);

      where.tripDate = {
        gte: startOfDay,
        lte: endOfDay,
      };
    }

    const trips = await prisma.trip.findMany({
      where,
      include: {
        bus: true,
        route: true,
      },
      orderBy: [
        { tripDate: "asc" },
        { departureTime: "asc" },
      ],
    });

    return successResponse(res, "Trips fetched successfully", trips);
  } catch (err) {
    console.error("searchTrips error:", err);
    return errorResponse(res, err.message);
  }
};

// ======================================================
// UPDATE TRIP
// owner/admin
// ======================================================
exports.updateTrip = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      routeId,
      tripDate,
      departureCity,
      arrivalCity,
      departureTime,
      arrivalTime,
      price,
      status,
      isActive,
    } = req.body;

    const existingTrip = await prisma.trip.findUnique({
      where: { id: parseInt(id) },
      include: {
        bus: true,
      },
    });

    if (!existingTrip) {
      return errorResponse(res, "Trip not found", 404);
    }

    // owner security
    if (req.user.role === "owner") {
      const owner = await prisma.owner.findFirst({
        where: { userId: req.user.id },
      });

      if (!owner) {
        return errorResponse(res, "Owner profile not found", 404);
      }

      if (existingTrip.bus.ownerId !== owner.id) {
        return errorResponse(
          res,
          "You can only update trips of your own buses",
          403
        );
      }
    }

    let finalRouteId = existingTrip.routeId;

    if (routeId !== undefined && routeId !== null && routeId !== "") {
      const route = await prisma.route.findUnique({
        where: { id: parseInt(routeId) },
      });

      if (!route) {
        return errorResponse(res, "Route not found", 404);
      }

      finalRouteId = route.id;
    }

    const updatedTrip = await prisma.trip.update({
      where: { id: parseInt(id) },
      data: {
        routeId: finalRouteId,
        tripDate: tripDate ? new Date(tripDate) : existingTrip.tripDate,
        departureCity:
          departureCity !== undefined ? departureCity : existingTrip.departureCity,
        arrivalCity:
          arrivalCity !== undefined ? arrivalCity : existingTrip.arrivalCity,
        departureTime:
          departureTime !== undefined ? departureTime : existingTrip.departureTime,
        arrivalTime:
          arrivalTime !== undefined ? arrivalTime : existingTrip.arrivalTime,
        price:
          price !== undefined ? Number(price) : existingTrip.price,
        status:
          status !== undefined ? status : existingTrip.status,
        isActive:
          isActive !== undefined ? Boolean(isActive) : existingTrip.isActive,
      },
      include: {
        bus: true,
        route: true,
      },
    });

    return successResponse(res, "Trip updated successfully", updatedTrip);
  } catch (err) {
    console.error("updateTrip error:", err);
    return errorResponse(res, err.message);
  }
};

// ======================================================
// DELETE TRIP
// owner/admin
// If bookings exist -> do not delete
// ======================================================
exports.deleteTrip = async (req, res) => {
  try {
    const { id } = req.params;

    const trip = await prisma.trip.findUnique({
      where: { id: parseInt(id) },
      include: {
        bus: true,
        bookings: true,
      },
    });

    if (!trip) {
      return errorResponse(res, "Trip not found", 404);
    }

    // owner security
    if (req.user.role === "owner") {
      const owner = await prisma.owner.findFirst({
        where: { userId: req.user.id },
      });

      if (!owner) {
        return errorResponse(res, "Owner profile not found", 404);
      }

      if (trip.bus.ownerId !== owner.id) {
        return errorResponse(
          res,
          "You can only delete trips of your own buses",
          403
        );
      }
    }

    if (trip.bookings.length > 0) {
      return errorResponse(
        res,
        "This trip already has bookings. Please cancel/deactivate it instead of deleting.",
        400
      );
    }

    await prisma.trip.delete({
      where: { id: parseInt(id) },
    });

    return successResponse(res, "Trip deleted successfully", null);
  } catch (err) {
    console.error("deleteTrip error:", err);
    return errorResponse(res, err.message);
  }
};