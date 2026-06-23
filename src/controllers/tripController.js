const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// ======================================================
// GET ALL TRIPS
// ======================================================
exports.getTrips = async (req, res) => {
  try {
    const trips = await prisma.trip.findMany({
      include: {
        bus: { include: { route: true } },
        route: true,
        template: true
      },
      orderBy: [
        { tripDate: "asc" },
        { departureTime: "asc" }
      ]
    });

    return res.status(200).json({ success: true, data: trips });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ======================================================
// GET TRIPS BY BUS
// ======================================================
exports.getTripsByBus = async (req, res) => {
  try {
    const busId = Number(req.params.busId);

    const trips = await prisma.trip.findMany({
      where: { busId },
      include: {
        bus: { include: { route: true } },
        route: true,
        template: true
      }
    });

    return res.status(200).json({ success: true, data: trips });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ======================================================
// GET SINGLE TRIP
// ======================================================
exports.getTripById = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const trip = await prisma.trip.findUnique({
      where: { id },
      include: {
        bus: { include: { route: true } },
        route: true,
        template: true,
        bookings: true
      }
    });

    if (!trip) {
      return res.status(404).json({ success: false, message: "Trip not found" });
    }

    return res.status(200).json({ success: true, data: trip });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ======================================================
// SEARCH TRIPS
// ======================================================
exports.searchTrips = async (req, res) => {
  try {
    const { start = "", end = "", date } = req.query;

    const where = {
      AND: [
        { departureCity: { contains: start, mode: "insensitive" } },
        { arrivalCity: { contains: end, mode: "insensitive" } }
      ]
    };

    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);

      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);

      where.tripDate = { gte: startDate, lte: endDate };
    }

    const trips = await prisma.trip.findMany({
      where,
      include: {
        bus: { include: { route: true } },
        route: true
      }
    });

    return res.status(200).json({ success: true, data: trips });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ======================================================
// CREATE TRIP
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
      status,
      isActive,
      templateId
    } = req.body;

    const trip = await prisma.trip.create({
      data: {
        tripCode: `TRIP-${Date.now()}`,
        busId: Number(busId),
        routeId: routeId ? Number(routeId) : null,
        templateId: templateId ? Number(templateId) : null,
        tripDate: new Date(tripDate),
        departureCity,
        arrivalCity,
        departureTime: new Date(departureTime),
        arrivalTime: new Date(arrivalTime),
        price: price ? Number(price) : 0,
        status: status || "ACTIVE",
        isActive: isActive !== undefined ? Boolean(isActive) : true
      }
    });

    return res.status(201).json({ success: true, data: trip });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ======================================================
// UPDATE TRIP
// ======================================================
exports.updateTrip = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const updated = await prisma.trip.update({
      where: { id },
      data: req.body
    });

    return res.status(200).json({ success: true, data: updated });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ======================================================
// DELETE TRIP
// ======================================================
exports.deleteTrip = async (req, res) => {
  try {
    const id = Number(req.params.id);

    await prisma.trip.delete({ where: { id } });

    return res.status(200).json({ success: true, message: "Deleted" });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ======================================================
// FIXED: GENERATE TRIPS (MISSING FUNCTION ADDED)
// ======================================================
exports.generateTripsFromTemplates = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      message: "Trip generation placeholder working (not implemented yet)"
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};