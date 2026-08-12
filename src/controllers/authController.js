const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

// REGISTER
exports.register = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role,
      licenseNumber,
      nic,
      phone,
      busId
    } = req.body;

    // CHECK EXISTING USER
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (role === "admin") {
      return res.status(403).json({
        success: false,
        message: "Admin registration not allowed"
      });
    }

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists"
      });
    }

    // HASH PASSWORD
    const hashedPassword = await bcrypt.hash(password, 10);

    // CREATE USER
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role || "passenger"
      }
    });

    // DRIVER PROFILE
    if (role === "driver") {
      await prisma.driver.create({
        data: {
          userId: user.id,
          licenseNumber,
          phoneNumber: phone,
          busId: busId || null
        }
      });
    }

    // OWNER PROFILE
    if (role === "owner") {
      await prisma.owner.create({
        data: {
          userId: user.id,
          nic
        }
      });
    }

    // CONDUCTOR PROFILE
    if (role === "conductor") {
      await prisma.conductor.create({
        data: {
          userId: user.id,
          nic,
          phone,
          busId: busId || null
        }
      });
    }

    const { password: _password, ...safeUser } = user;

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: safeUser
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// LOGIN
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        driver: true,
        owner: true,
        conductor: true
      }
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    const { password: _, ...userWithoutPassword } = user;

    res.json({
      message: "Login successful",
      token,
      user: userWithoutPassword
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET CURRENT USER PROFILE
exports.getProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        driver: { include: { bus: { include: { route: true } } } },
        owner: true,
        conductor: { include: { bus: { include: { route: true } } } }
      }
    });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Gather role-specific stats
    let roleStats = {};
    if (user.role === "passenger") {
      const bookingsCount = await prisma.booking.count({ where: { userId: user.id } });
      const activeTicketsCount = await prisma.booking.count({
        where: { userId: user.id, paymentStatus: "PAID", isUsed: false }
      });
      roleStats = { totalBookings: bookingsCount, activeTickets: activeTicketsCount };
    } else if (user.role === "owner") {
      const busesCount = await prisma.bus.count({ where: { ownerId: user.id } });
      const templatesCount = await prisma.tripTemplate.count();
      roleStats = { totalBuses: busesCount, totalSchedules: templatesCount };
    } else if (user.role === "admin") {
      const usersCount = await prisma.user.count();
      const busesCount = await prisma.bus.count();
      roleStats = { totalUsers: usersCount, totalBuses: busesCount };
    }

    const { password: _, ...userData } = user;

    res.json({
      success: true,
      data: {
        ...userData,
        roleStats
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// UPDATE PROFILE
exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, nic, licenseNumber } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: { name }
    });

    // Update role specific sub-tables if needed
    if (req.user.role === "driver" && (phone || licenseNumber)) {
      await prisma.driver.updateMany({
        where: { userId: req.user.id },
        data: {
          ...(phone && { phoneNumber: phone }),
          ...(licenseNumber && { licenseNumber })
        }
      });
    }

    if (req.user.role === "owner" && nic) {
      await prisma.owner.updateMany({
        where: { userId: req.user.id },
        data: { nic }
      });
    }

    if (req.user.role === "conductor" && (phone || nic)) {
      await prisma.conductor.updateMany({
        where: { userId: req.user.id },
        data: {
          ...(phone && { phone }),
          ...(nic && { nic })
        }
      });
    }

    const fullUser = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { driver: true, owner: true, conductor: true }
    });

    const { password: _, ...userWithoutPassword } = fullUser;

    return res.json({
      success: true,
      message: "Profile updated successfully",
      data: userWithoutPassword
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// CHANGE PASSWORD
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: "Both current and new password are required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: "New password must be at least 6 characters" });
    }

    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Incorrect current password" });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: req.user.id },
      data: { password: hashedNewPassword }
    });

    return res.json({
      success: true,
      message: "Password changed successfully"
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};