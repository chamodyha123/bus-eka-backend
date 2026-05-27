const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// CREATE BUS
exports.createBus = async (req, res) => {
  try {
    const {
      licensePlate,
      routePermitNumber,
      busType,
      category,
      imageUrl
    } = req.body;

    const bus = await prisma.bus.create({
      data: {
        licensePlate,
        routePermitNumber,
        busType,
        category,
        imageUrl
      }
    });

    res.status(201).json(bus);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET ALL BUSES
exports.getBuses = async (req, res) => {
  try {
    const buses = await prisma.bus.findMany({
      include: { drivers: true }
    });

    res.json(buses);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};