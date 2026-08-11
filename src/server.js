const http = require("http");
const app = require("./app");
const { initSocket } = require("./sockets/socket");

const PORT = process.env.PORT || 5000;

// Jobs
const unlockExpiredSeats = require("./jobs/seatLockScheduler");
const { startTripGenerationJob } = require("./jobs/tripGenerationJob");

const server = http.createServer(app);

// Initialize Socket.IO
initSocket(server);

/**
 * ==============================
 * START BACKGROUND JOBS SAFELY
 * ==============================
 */
async function startJobs() {
  try {
    console.log("⏳ Starting background jobs...");

    await startTripGenerationJob();
    console.log("🚍 Trip generation job started");

  } catch (err) {
    console.error("❌ Failed to start jobs:", err.message);
  }
}

// Start jobs AFTER server setup
startJobs();

/**
 * ==============================
 * SEAT UNLOCK SCHEDULER
 * ==============================
 */
const seatUnlockInterval = setInterval(async () => {
  try {
    const unlockedCount = await unlockExpiredSeats();

    if (unlockedCount > 0) {
      console.log(`🔓 Unlocked ${unlockedCount} expired seat(s)`);
    }
  } catch (err) {
    console.error("❌ Seat unlock scheduler error:", err.message);
  }
}, 60000);

/**
 * ==============================
 * START SERVER
 * ==============================
 */
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

/**
 * ==============================
 * GLOBAL ERROR HANDLERS
 * ==============================
 */
process.on("unhandledRejection", (err) => {
  console.error("❌ Unhandled Rejection:", err);
});

process.on("uncaughtException", (err) => {
  console.error("❌ Uncaught Exception:", err);

  // safer shutdown instead of immediate crash in production
  console.log("💥 Shutting down server gracefully...");
  server.close(() => process.exit(1));
});

/**
 * ==============================
 * GRACEFUL SHUTDOWN (CTRL+C)
 * ==============================
 */
process.on("SIGINT", () => {
  console.log("🛑 Shutting down server...");

  clearInterval(seatUnlockInterval);

  server.close(() => {
    console.log("✅ Server closed gracefully");
    process.exit(0);
  });
});