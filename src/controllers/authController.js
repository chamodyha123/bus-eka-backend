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

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      user
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
      where: { email }
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

    res.json({
      message: "Login successful",
      token,
      user
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};