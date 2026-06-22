const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// ======================================================
// CREATE ROUTE
// ======================================================
exports.createRoute = async (req, res) => {
  try {
    const {
      routeNumber,
      routePermitNumber,
      startLocation,
      endLocation,
      distanceKm
    } = req.body;

    if (
      !routeNumber ||
      !routePermitNumber ||
      !startLocation ||
      !endLocation
    ) {
      return res.status(400).json({
        success: false,
        message:
          "routeNumber, routePermitNumber, startLocation and endLocation are required"
      });
    }

    const existingRoute = await prisma.route.findUnique({
      where: { routePermitNumber }
    });

    if (existingRoute) {
      return res.status(400).json({
        success: false,
        message: "Route permit number already exists"
      });
    }

    const route = await prisma.route.create({
      data: {
        routeNumber: routeNumber.trim(),
        routePermitNumber: routePermitNumber.trim(),
        startLocation: startLocation.trim(),
        endLocation: endLocation.trim(),
        distanceKm:
          distanceKm !== undefined &&
          distanceKm !== null &&
          distanceKm !== ""
            ? Number(distanceKm)
            : null
      }
    });

    return res.status(201).json({
      success: true,
      message: "Route created successfully",
      data: route
    });
  } catch (err) {
    console.error("createRoute error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to create route",
      error: err.message
    });
  }
};

// ======================================================
// GET ALL ROUTES
// ======================================================
exports.getRoutes = async (req, res) => {
  try {
    const routes = await prisma.route.findMany({
      include: {
        buses: true
      },
      orderBy: {
        id: "desc"
      }
    });

    return res.status(200).json({
      success: true,
      data: routes
    });
  } catch (err) {
    console.error("getRoutes error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch routes",
      error: err.message
    });
  }
};

// ======================================================
// SEARCH ROUTES
// /api/routes/search?start=Colombo&end=Kandy
// ======================================================
exports.searchRoutes = async (req, res) => {
  try {
    const { start = "", end = "" } = req.query;

    const routes = await prisma.route.findMany({
      where: {
        AND: [
          {
            startLocation: {
              contains: start,
              mode: "insensitive"
            }
          },
          {
            endLocation: {
              contains: end,
              mode: "insensitive"
            }
          }
        ]
      },
      include: {
        buses: true
      },
      orderBy: {
        id: "desc"
      }
    });

    return res.status(200).json({
      success: true,
      data: routes
    });
  } catch (err) {
    console.error("searchRoutes error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to search routes",
      error: err.message
    });
  }
};

// ======================================================
// GET ROUTE BY ID
// ======================================================
exports.getRouteById = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const route = await prisma.route.findUnique({
      where: { id },
      include: {
        buses: true
      }
    });

    if (!route) {
      return res.status(404).json({
        success: false,
        message: "Route not found"
      });
    }

    return res.status(200).json({
      success: true,
      data: route
    });
  } catch (err) {
    console.error("getRouteById error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch route",
      error: err.message
    });
  }
};

// ======================================================
// UPDATE ROUTE
// ======================================================
exports.updateRoute = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const {
      routeNumber,
      routePermitNumber,
      startLocation,
      endLocation,
      distanceKm
    } = req.body;

    const existingRoute = await prisma.route.findUnique({
      where: { id }
    });

    if (!existingRoute) {
      return res.status(404).json({
        success: false,
        message: "Route not found"
      });
    }

    if (
      routePermitNumber &&
      routePermitNumber !== existingRoute.routePermitNumber
    ) {
      const duplicate = await prisma.route.findUnique({
        where: { routePermitNumber }
      });

      if (duplicate) {
        return res.status(400).json({
          success: false,
          message: "Route permit number already exists"
        });
      }
    }

    const updatedRoute = await prisma.route.update({
      where: { id },
      data: {
        routeNumber:
          routeNumber !== undefined
            ? routeNumber.trim()
            : existingRoute.routeNumber,

        routePermitNumber:
          routePermitNumber !== undefined
            ? routePermitNumber.trim()
            : existingRoute.routePermitNumber,

        startLocation:
          startLocation !== undefined
            ? startLocation.trim()
            : existingRoute.startLocation,

        endLocation:
          endLocation !== undefined
            ? endLocation.trim()
            : existingRoute.endLocation,

        distanceKm:
          distanceKm !== undefined
            ? distanceKm === null || distanceKm === ""
              ? null
              : Number(distanceKm)
            : existingRoute.distanceKm
      }
    });

    return res.status(200).json({
      success: true,
      message: "Route updated successfully",
      data: updatedRoute
    });
  } catch (err) {
    console.error("updateRoute error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to update route",
      error: err.message
    });
  }
};

// ======================================================
// DELETE ROUTE
// ======================================================
exports.deleteRoute = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const route = await prisma.route.findUnique({
      where: { id },
      include: {
        buses: true
      }
    });

    if (!route) {
      return res.status(404).json({
        success: false,
        message: "Route not found"
      });
    }

    // Prevent deleting route if buses are assigned
    if (route.buses && route.buses.length > 0) {
      return res.status(400).json({
        success: false,
        message:
          "Cannot delete route because buses are assigned to this route"
      });
    }

    await prisma.route.delete({
      where: { id }
    });

    return res.status(200).json({
      success: true,
      message: "Route deleted successfully"
    });
  } catch (err) {
    console.error("deleteRoute error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to delete route",
      error: err.message
    });
  }
};