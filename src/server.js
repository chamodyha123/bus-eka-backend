const http = require("http");
const app = require("./app");
const { initSocket } = require("./sockets/socket");

const PORT = process.env.PORT || 5000;

// Seat lock scheduler
const unlockExpiredSeats = require("./jobs/seatLockScheduler");

const server = http.createServer(app);

// Initialize Socket.IO
initSocket(server);

// Auto-unlock expired seats every minute
setInterval(async () => {
  try {
    const unlockedCount = await unlockExpiredSeats();

    if (unlockedCount > 0) {
      console.log(`🔓 Unlocked ${unlockedCount} expired seat(s)`);
    }
  } catch (err) {
    console.error("Seat unlock scheduler error:", err.message);
  }
}, 60000);

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.error("❌ Unhandled Rejection:", err);
});

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  console.error("❌ Uncaught Exception:", err);
  process.exit(1);
});