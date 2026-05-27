const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// CREATE ROUTE
exports.createRoute = async (req, res) => {
  try {
    const {
      routeNumber,
      startLocation,
      endLocation,
      departureTime,
      arrivalTime
    } = req.body;

    const route = await prisma.route.create({
      data: {
        routeNumber,
        startLocation,
        endLocation,
        departureTime,
        arrivalTime
      }
    });

    res.status(201).json(route);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET ALL ROUTES
exports.getRoutes = async (req, res) => {
  try {
    const routes = await prisma.route.findMany({
      include: { buses: true }
    });

    res.json(routes);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// SEARCH ROUTES
exports.searchRoutes = async (req, res) => {
  try {
    const { start, end } = req.query;

    const routes = await prisma.route.findMany({
      where: {
        startLocation: {
          contains: start,
          mode: "insensitive"
        },
        endLocation: {
          contains: end,
          mode: "insensitive"
        }
      },
      include: {
        buses: true
      }
    });

    res.json(routes);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};