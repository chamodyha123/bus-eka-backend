const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// ======================================================
// CREATE BUS
// Owner enters routePermitNumber
// System finds route by routePermitNumber and stores routeId
// ======================================================
exports.createBus = async (req, res) => {
  try {
    const {
      licensePlate,
      routePermitNumber,
      busType,
      category,
      imageUrl,
      seatCount,
      seatLayout
    } = req.body;

    if (!licensePlate || !busType || !category || !seatCount) {
      return res.status(400).json({
        success: false,
        message: "licensePlate, busType, category and seatCount are required"
      });
    }

    const existingBus = await prisma.bus.findUnique({
      where: { licensePlate }
    });

    if (existingBus) {
      return res.status(400).json({
        success: false,
        message: "Bus with this license plate already exists"
      });
    }

    let matchedRoute = null;

    if (routePermitNumber) {
      matchedRoute = await prisma.route.findUnique({
        where: { routePermitNumber }
      });

      if (!matchedRoute) {
        return res.status(404).json({
          success: false,
          message: "No route found for the given route permit number"
        });
      }
    }

    let ownerRecord = null;

    if (req.user?.role === "owner") {
      ownerRecord = await prisma.owner.findUnique({
        where: { userId: req.user.id }
      });

      if (!ownerRecord) {
        return res.status(404).json({
          success: false,
          message: "Owner profile not found"
        });
      }
    }

    const bus = await prisma.bus.create({
      data: {
        licensePlate,
        routePermitNumber: routePermitNumber || null,
        busType,
        category,
        imageUrl: imageUrl || null,
        seatCount: Number(seatCount),
        seatLayout: seatLayout || "2x2",
        routeId: matchedRoute ? matchedRoute.id : null,
        ownerId: ownerRecord ? ownerRecord.id : null
      },
      include: {
        route: true,
        owner: {
          include: {
            user: true
          }
        }
      }
    });

    // Optional seat auto-create
    const totalSeats = Number(seatCount);
    if (!isNaN(totalSeats) && totalSeats > 0) {
      const seatsData = [];
      for (let i = 1; i <= totalSeats; i++) {
        seatsData.push({
          seatNumber: `S${i}`,
          busId: bus.id
        });
      }

      await prisma.seat.createMany({
        data: seatsData
      });
    }

    return res.status(201).json({
      success: true,
      message: "Bus created successfully",
      data: bus
    });
  } catch (err) {
    console.error("createBus error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to create bus",
      error: err.message
    });
  }
};

// ======================================================
// GET ALL BUSES
// Owner -> only own buses
// Admin -> all buses
// ======================================================
exports.getBuses = async (req, res) => {
  try {
    let where = {};

    if (req.user?.role === "owner") {
      const owner = await prisma.owner.findUnique({
        where: { userId: req.user.id }
      });

      if (!owner) {
        return res.status(404).json({
          success: false,
          message: "Owner profile not found"
        });
      }

      where.ownerId = owner.id;
    }

    const buses = await prisma.bus.findMany({
      where,
      include: {
        route: true,
        owner: {
          include: {
            user: true
          }
        }
      },
      orderBy: {
        id: "desc"
      }
    });

    return res.status(200).json({
      success: true,
      data: buses
    });
  } catch (err) {
    console.error("getBuses error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch buses",
      error: err.message
    });
  }
};

// ======================================================
// GET BUS BY ID
// ======================================================
exports.getBusById = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const bus = await prisma.bus.findUnique({
      where: { id },
      include: {
        route: true,
        drivers: true,
        conductors: true,
        seats: true
      }
    });

    if (!bus) {
      return res.status(404).json({
        success: false,
        message: "Bus not found"
      });
    }

    return res.status(200).json({
      success: true,
      data: bus
    });
  } catch (err) {
    console.error("getBusById error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch bus",
      error: err.message
    });
  }
};

// ======================================================
// GET BUSES BY ROUTE ID
// ======================================================
exports.getBusesByRoute = async (req, res) => {
  try {
    const routeId = Number(req.params.routeId);

    const buses = await prisma.bus.findMany({
      where: {
        routeId
      },
      include: {
        route: true
      }
    });

    return res.status(200).json({
      success: true,
      data: buses
    });
  } catch (err) {
    console.error("getBusesByRoute error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch buses by route",
      error: err.message
    });
  }
};

// ======================================================
// UPDATE BUS
// routePermitNumber is used to find routeId automatically
// ======================================================
exports.updateBus = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const {
      licensePlate,
      routePermitNumber,
      busType,
      category,
      imageUrl,
      seatCount,
      seatLayout
    } = req.body;

    const existingBus = await prisma.bus.findUnique({
      where: { id }
    });

    if (!existingBus) {
      return res.status(404).json({
        success: false,
        message: "Bus not found"
      });
    }

    // owner security
    if (req.user?.role === "owner") {
      const owner = await prisma.owner.findUnique({
        where: { userId: req.user.id }
      });

      if (!owner || existingBus.ownerId !== owner.id) {
        return res.status(403).json({
          success: false,
          message: "You can only update your own buses"
        });
      }
    }

    if (
      licensePlate &&
      licensePlate !== existingBus.licensePlate
    ) {
      const duplicate = await prisma.bus.findUnique({
        where: { licensePlate }
      });

      if (duplicate) {
        return res.status(400).json({
          success: false,
          message: "Another bus already uses this license plate"
        });
      }
    }

    let matchedRouteId = existingBus.routeId;
    let finalRoutePermitNumber =
      routePermitNumber !== undefined
        ? routePermitNumber
        : existingBus.routePermitNumber;

    if (routePermitNumber !== undefined) {
      if (routePermitNumber === "" || routePermitNumber === null) {
        matchedRouteId = null;
        finalRoutePermitNumber = null;
      } else {
        const matchedRoute = await prisma.route.findUnique({
          where: { routePermitNumber }
        });

        if (!matchedRoute) {
          return res.status(404).json({
            success: false,
            message: "No route found for the given route permit number"
          });
        }

        matchedRouteId = matchedRoute.id;
        finalRoutePermitNumber = routePermitNumber;
      }
    }

    const updatedBus = await prisma.bus.update({
      where: { id },
      data: {
        licensePlate:
          licensePlate !== undefined ? licensePlate : existingBus.licensePlate,
        routePermitNumber: finalRoutePermitNumber,
        busType: busType !== undefined ? busType : existingBus.busType,
        category: category !== undefined ? category : existingBus.category,
        imageUrl: imageUrl !== undefined ? imageUrl : existingBus.imageUrl,
        seatCount:
          seatCount !== undefined ? Number(seatCount) : existingBus.seatCount,
        seatLayout:
          seatLayout !== undefined ? seatLayout : existingBus.seatLayout,
        routeId: matchedRouteId
      },
      include: {
        route: true
      }
    });

    return res.status(200).json({
      success: true,
      message: "Bus updated successfully",
      data: updatedBus
    });
  } catch (err) {
    console.error("updateBus error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to update bus",
      error: err.message
    });
  }
};

// ======================================================
// DELETE BUS
// ======================================================
exports.deleteBus = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const bus = await prisma.bus.findUnique({
      where: { id }
    });

    if (!bus) {
      return res.status(404).json({
        success: false,
        message: "Bus not found"
      });
    }

    if (req.user?.role === "owner") {
      const owner = await prisma.owner.findUnique({
        where: { userId: req.user.id }
      });

      if (!owner || bus.ownerId !== owner.id) {
        return res.status(403).json({
          success: false,
          message: "You can only delete your own buses"
        });
      }
    }

    await prisma.bus.delete({
      where: { id }
    });

    return res.status(200).json({
      success: true,
      message: "Bus deleted successfully"
    });
  } catch (err) {
    console.error("deleteBus error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to delete bus",
      error: err.message
    });
  }
};