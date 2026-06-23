const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// ======================================================
// HELPERS
// ======================================================
function combineDateAndTime(date, timeString) {
  // timeString = "08:30"
  const [hours, minutes] = timeString.split(":").map(Number);

  const d = new Date(date);
  d.setHours(hours || 0);
  d.setMinutes(minutes || 0);
  d.setSeconds(0);
  d.setMilliseconds(0);

  return d;
}

function generateTripCode(prefix = "TRIP") {
  const random = Math.floor(100000 + Math.random() * 900000);
  return `${prefix}-${Date.now()}-${random}`;
}

// ======================================================
// CREATE TEMPLATE
// ======================================================
exports.createTripTemplate = async (req, res) => {
  try {
    const {
      busId,
      routeId,
      departureTime, // "08:30"
      arrivalTime,   // "11:45"
      price,
      isActive
    } = req.body;

    if (!busId || !departureTime || !arrivalTime) {
      return res.status(400).json({
        success: false,
        message: "busId, departureTime and arrivalTime are required"
      });
    }

    const bus = await prisma.bus.findUnique({
      where: { id: Number(busId) },
      include: { route: true }
    });

    if (!bus) {
      return res.status(404).json({
        success: false,
        message: "Bus not found"
      });
    }

    let finalRouteId = routeId ? Number(routeId) : bus.routeId || null;

    if (!finalRouteId) {
      return res.status(400).json({
        success: false,
        message: "No route assigned to bus. Please assign a route first or provide routeId."
      });
    }

    const route = await prisma.route.findUnique({
      where: { id: finalRouteId }
    });

    if (!route) {
      return res.status(404).json({
        success: false,
        message: "Route not found"
      });
    }

    const template = await prisma.tripTemplate.create({
      data: {
        busId: Number(busId),
        routeId: finalRouteId,
        departureCity: route.startLocation,
        arrivalCity: route.endLocation,
        departureTime,
        arrivalTime,
        price: price ? Number(price) : 0,
        isActive: isActive !== undefined ? Boolean(isActive) : true
      },
      include: {
        bus: true,
        route: true
      }
    });

    return res.status(201).json({
      success: true,
      message: "Trip template created successfully",
      data: template
    });
  } catch (err) {
    console.error("createTripTemplate error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to create trip template",
      error: err.message
    });
  }
};

// ======================================================
// GET ALL TEMPLATES
// ======================================================
exports.getTripTemplates = async (req, res) => {
  try {
    const templates = await prisma.tripTemplate.findMany({
      include: {
        bus: {
          include: {
            route: true
          }
        },
        route: true
      },
      orderBy: {
        id: "desc"
      }
    });

    return res.status(200).json({
      success: true,
      data: templates
    });
  } catch (err) {
    console.error("getTripTemplates error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch trip templates",
      error: err.message
    });
  }
};

// ======================================================
// GET TEMPLATE BY ID
// ======================================================
exports.getTripTemplateById = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const template = await prisma.tripTemplate.findUnique({
      where: { id },
      include: {
        bus: {
          include: { route: true }
        },
        route: true
      }
    });

    if (!template) {
      return res.status(404).json({
        success: false,
        message: "Trip template not found"
      });
    }

    return res.status(200).json({
      success: true,
      data: template
    });
  } catch (err) {
    console.error("getTripTemplateById error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch trip template",
      error: err.message
    });
  }
};

// ======================================================
// UPDATE TEMPLATE
// ======================================================
exports.updateTripTemplate = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const {
      busId,
      routeId,
      departureTime,
      arrivalTime,
      price,
      isActive
    } = req.body;

    const existing = await prisma.tripTemplate.findUnique({
      where: { id }
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Trip template not found"
      });
    }

    let finalBusId = busId ? Number(busId) : existing.busId;
    let finalRouteId = routeId ? Number(routeId) : existing.routeId;

    const bus = await prisma.bus.findUnique({
      where: { id: finalBusId },
      include: { route: true }
    });

    if (!bus) {
      return res.status(404).json({
        success: false,
        message: "Bus not found"
      });
    }

    if (!finalRouteId) {
      finalRouteId = bus.routeId || null;
    }

    if (!finalRouteId) {
      return res.status(400).json({
        success: false,
        message: "No route assigned to bus"
      });
    }

    const route = await prisma.route.findUnique({
      where: { id: finalRouteId }
    });

    if (!route) {
      return res.status(404).json({
        success: false,
        message: "Route not found"
      });
    }

    const updated = await prisma.tripTemplate.update({
      where: { id },
      data: {
        busId: finalBusId,
        routeId: finalRouteId,
        departureCity: route.startLocation,
        arrivalCity: route.endLocation,
        departureTime: departureTime ?? existing.departureTime,
        arrivalTime: arrivalTime ?? existing.arrivalTime,
        price:
          price !== undefined
            ? Number(price)
            : existing.price,
        isActive:
          isActive !== undefined
            ? Boolean(isActive)
            : existing.isActive
      },
      include: {
        bus: true,
        route: true
      }
    });

    return res.status(200).json({
      success: true,
      message: "Trip template updated successfully",
      data: updated
    });
  } catch (err) {
    console.error("updateTripTemplate error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to update trip template",
      error: err.message
    });
  }
};

// ======================================================
// DELETE TEMPLATE
// ======================================================
exports.deleteTripTemplate = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const existing = await prisma.tripTemplate.findUnique({
      where: { id }
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Trip template not found"
      });
    }

    await prisma.tripTemplate.delete({
      where: { id }
    });

    return res.status(200).json({
      success: true,
      message: "Trip template deleted successfully"
    });
  } catch (err) {
    console.error("deleteTripTemplate error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to delete trip template",
      error: err.message
    });
  }
};

// ======================================================
// GENERATE TODAY TRIPS FROM TEMPLATES
// ======================================================
exports.generateTodayTripsFromTemplates = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const templates = await prisma.tripTemplate.findMany({
      where: { isActive: true },
      include: {
        bus: true,
        route: true
      }
    });

    let createdCount = 0;
    const createdTrips = [];

    for (const template of templates) {
      const existingTrip = await prisma.trip.findFirst({
        where: {
          templateId: template.id,
          tripDate: {
            gte: today,
            lt: tomorrow
          }
        }
      });

      if (existingTrip) {
        continue;
      }

      const departureDateTime = combineDateAndTime(today, template.departureTime);
      const arrivalDateTime = combineDateAndTime(today, template.arrivalTime);

      const trip = await prisma.trip.create({
        data: {
          tripCode: generateTripCode("TRIP"),
          tripDate: today,
          busId: template.busId,
          routeId: template.routeId,
          templateId: template.id,
          departureCity: template.departureCity,
          arrivalCity: template.arrivalCity,
          departureTime: departureDateTime,
          arrivalTime: arrivalDateTime,
          price: template.price || 0,
          status: "ACTIVE",
          isActive: true
        }
      });

      createdTrips.push(trip);
      createdCount++;
    }

    return res.status(200).json({
      success: true,
      message: `${createdCount} trips generated for today`,
      data: createdTrips
    });
  } catch (err) {
    console.error("generateTodayTripsFromTemplates error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to generate today's trips",
      error: err.message
    });
  }
};