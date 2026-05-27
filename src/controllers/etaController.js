const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// CALCULATE ETA
exports.calculateETA = async (req, res) => {
  try {
    const { routeId, averageSpeed } = req.body;

    const route = await prisma.route.findUnique({
      where: {
        id: routeId
      }
    });

    if (!route) {
      return res.status(404).json({
        message: "Route not found"
      });
    }

    if (!route.distanceKm) {
      return res.status(400).json({
        message: "Route distance not set"
      });
    }

    // ETA CALCULATION
    const etaHours = route.distanceKm / averageSpeed;

    const etaMinutes = Math.round(etaHours * 60);

    res.json({
      route: `${route.startLocation} → ${route.endLocation}`,
      distanceKm: route.distanceKm,
      averageSpeed,
      estimatedArrivalMinutes: etaMinutes
    });

  } catch (err) {
    res.status(500).json({
      message: err.message
    });
  }
};