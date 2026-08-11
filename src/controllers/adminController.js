const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// ===================== USERS =====================
exports.getUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        nic: true,
        phone: true,
        createdAt: true
      },
      orderBy: { createdAt: "desc" }
    });

    res.json({
      success: true,
      data: users
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    const allowedRoles = ["admin", "owner", "driver", "conductor", "passenger"];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ success: false, message: "Invalid role" });
    }

    const updated = await prisma.user.update({
      where: { id: Number(id) },
      data: { role },
      select: { id: true, name: true, email: true, role: true }
    });

    res.json({ success: true, message: "User role updated successfully", data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.user.delete({ where: { id: Number(id) } });
    res.json({ success: true, message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ===================== BUSES =====================
exports.getBuses = async (req, res) => {
  try {
    const buses = await prisma.bus.findMany({
      include: {
        route: true,
        owner: true,
        drivers: true
      }
    });

    res.json({
      success: true,
      data: buses
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ===================== ROUTES =====================
exports.getRoutes = async (req, res) => {
  try {
    const routes = await prisma.route.findMany({
      include: {
        buses: true
      }
    });

    res.json({
      success: true,
      data: routes
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ===================== EMERGENCY =====================
exports.getEmergencyReports = async (req, res) => {
  try {
    const reports = await prisma.emergencyReport.findMany({
      include: {
        user: true,
        bus: true
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    res.json({
      success: true,
      data: reports
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ===================== STATS =====================
exports.getStats = async (req, res) => {
  try {
    const totalUsers = await prisma.user.count();
    const totalBuses = await prisma.bus.count();
    const totalRoutes = await prisma.route.count();
    const totalEmergency = await prisma.emergencyReport.count();

    res.json({
      success: true,
      data: {
        totalUsers,
        totalBuses,
        totalRoutes,
        totalEmergency
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};