const { PrismaClient } = require("@prisma/client");
const { generateTripForTemplate } = require("../services/tripService");
const prisma = new PrismaClient();

const normalizeDays = (value) => {
  const allowed = new Set(["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"]);
  const days = String(value || "MON,TUE,WED,THU,FRI,SAT,SUN")
    .split(",")
    .map((day) => day.trim().toUpperCase())
    .filter((day, index, array) => allowed.has(day) && array.indexOf(day) === index);
  if (!days.length) throw new Error("Select at least one valid active day");
  return days.join(",");
};

const validateTime = (value, field) => {
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(String(value || ""))) {
    throw new Error(`${field} must use HH:mm format`);
  }
};

async function resolveBusAndRoute(busId, routeId) {
  const bus = await prisma.bus.findUnique({ where: { id: Number(busId) } });
  if (!bus) throw Object.assign(new Error("Bus not found"), { status: 404 });

  const finalRouteId = routeId ? Number(routeId) : bus.routeId;
  if (!finalRouteId) throw Object.assign(new Error("Select a route for this schedule"), { status: 400 });

  const route = await prisma.route.findUnique({ where: { id: finalRouteId } });
  if (!route) throw Object.assign(new Error("Route not found"), { status: 404 });
  return { bus, route, finalRouteId };
}

exports.createTripTemplate = async (req, res) => {
  try {
    const { busId, routeId, departureTime, arrivalTime, price = 0, activeDays, isActive = true } = req.body;
    if (!busId || !departureTime || !arrivalTime) {
      return res.status(400).json({ success: false, message: "Bus, departure time and arrival time are required" });
    }
    validateTime(departureTime, "Departure time");
    validateTime(arrivalTime, "Arrival time");
    const { route, finalRouteId } = await resolveBusAndRoute(busId, routeId);

    const template = await prisma.tripTemplate.create({
      data: {
        busId: Number(busId),
        routeId: finalRouteId,
        departureCity: route.startLocation,
        arrivalCity: route.endLocation,
        departureTime,
        arrivalTime,
        price: Math.max(0, Number(price) || 0),
        activeDays: normalizeDays(activeDays),
        isActive: Boolean(isActive)
      },
      include: { bus: true, route: true }
    });

    const todayTrip = await generateTripForTemplate(template);
    return res.status(201).json({
      success: true,
      message: todayTrip
        ? "Schedule created and today's trip generated automatically"
        : "Schedule created. A trip will be generated automatically on its next active day",
      data: template,
      todayTrip
    });
  } catch (err) {
    console.error("createTripTemplate error:", err);
    return res.status(err.status || 500).json({ success: false, message: err.message || "Failed to create schedule" });
  }
};

exports.getTripTemplates = async (_req, res) => {
  try {
    const data = await prisma.tripTemplate.findMany({
      include: { bus: { include: { route: true, owner: { include: { user: true } } } }, route: true },
      orderBy: [{ isActive: "desc" }, { createdAt: "desc" }]
    });
    return res.json({ success: true, data });
  } catch (err) {
    console.error("getTripTemplates error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.getTripTemplateById = async (req, res) => {
  try {
    const data = await prisma.tripTemplate.findUnique({
      where: { id: Number(req.params.id) },
      include: { bus: true, route: true, trips: { orderBy: { tripDate: "desc" }, take: 10 } }
    });
    if (!data) return res.status(404).json({ success: false, message: "Trip schedule not found" });
    return res.json({ success: true, data });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateTripTemplate = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const existing = await prisma.tripTemplate.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ success: false, message: "Trip schedule not found" });

    const busId = req.body.busId ?? existing.busId;
    const routeId = req.body.routeId ?? existing.routeId;
    const { route, finalRouteId } = await resolveBusAndRoute(busId, routeId);
    const departureTime = req.body.departureTime ?? existing.departureTime;
    const arrivalTime = req.body.arrivalTime ?? existing.arrivalTime;
    validateTime(departureTime, "Departure time");
    validateTime(arrivalTime, "Arrival time");

    const data = await prisma.tripTemplate.update({
      where: { id },
      data: {
        busId: Number(busId),
        routeId: finalRouteId,
        departureCity: route.startLocation,
        arrivalCity: route.endLocation,
        departureTime,
        arrivalTime,
        price: req.body.price !== undefined ? Math.max(0, Number(req.body.price) || 0) : existing.price,
        activeDays: req.body.activeDays !== undefined ? normalizeDays(req.body.activeDays) : existing.activeDays,
        isActive: req.body.isActive !== undefined ? Boolean(req.body.isActive) : existing.isActive
      },
      include: { bus: true, route: true }
    });

    // Safe catch-up after activating or changing a schedule.
    const todayTrip = await generateTripForTemplate(data);
    return res.json({ success: true, message: "Trip schedule updated", data, todayTrip });
  } catch (err) {
    console.error("updateTripTemplate error:", err);
    return res.status(err.status || 500).json({ success: false, message: err.message });
  }
};

exports.deleteTripTemplate = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const existing = await prisma.tripTemplate.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ success: false, message: "Trip schedule not found" });

    // Preserve historical bookings/trips and remove only the recurring link.
    await prisma.$transaction([
      prisma.trip.updateMany({ where: { templateId: id }, data: { templateId: null } }),
      prisma.tripTemplate.delete({ where: { id } })
    ]);
    return res.json({ success: true, message: "Trip schedule deleted; existing trips were preserved" });
  } catch (err) {
    console.error("deleteTripTemplate error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};
