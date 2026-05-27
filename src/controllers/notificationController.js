const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const { getIO } = require("../sockets/socket");

// CREATE NOTIFICATION
exports.createNotification = async (req, res) => {
  try {
    const {
      title,
      message,
      type,
      userId
    } = req.body;

    const notification = await prisma.notification.create({
      data: {
        title,
        message,
        type,
        userId
      }
    });

    // REAL-TIME NOTIFICATION
    const io = getIO();

    io.emit("newNotification", notification);

    res.status(201).json(notification);

  } catch (err) {
    res.status(500).json({
      message: err.message
    });
  }
};

// GET USER NOTIFICATIONS
exports.getUserNotifications = async (req, res) => {
  try {
    const { userId } = req.params;

    const notifications = await prisma.notification.findMany({
      where: {
        userId: parseInt(userId)
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    res.json(notifications);

  } catch (err) {
    res.status(500).json({
      message: err.message
    });
  }
};