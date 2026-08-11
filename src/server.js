const http = require("http");
const app = require("./app");
const { initSocket } = require("./sockets/socket");

// ========================================
// SERVER CONFIGURATION
// ========================================

const PORT = process.env.PORT || 5000;
const HOST = "0.0.0.0";

// ========================================
// JOBS
// ========================================

const unlockExpiredSeats = require("./jobs/seatLockScheduler");
const {
  startTripGenerationJob
} = require("./jobs/tripGenerationJob");

// ========================================
// CREATE HTTP SERVER
// ========================================

const server = http.createServer(app);

// ========================================
// INITIALIZE SOCKET.IO
// ========================================

initSocket(server);

// ========================================
// START BACKGROUND JOBS
// ========================================

async function startJobs() {
  try {
    console.log("⏳ Starting background jobs...");

    await startTripGenerationJob();

    console.log("🚍 Trip generation job started");
  } catch (err) {
    console.error(
      "❌ Failed to start jobs:",
      err.message
    );
  }
}

startJobs();

// ========================================
// SEAT UNLOCK SCHEDULER
// ========================================

const seatUnlockInterval = setInterval(async () => {
  try {
    const unlockedCount = await unlockExpiredSeats();

    if (unlockedCount > 0) {
      console.log(
        `🔓 Unlocked ${unlockedCount} expired seat(s)`
      );
    }
  } catch (err) {
    console.error(
      "❌ Seat unlock scheduler error:",
      err.message
    );
  }
}, 60000);

// ========================================
// START SERVER
// ========================================

server.listen(PORT, HOST, () => {
  console.log("========================================");
  console.log("🚌 BUS EKA BACKEND");
  console.log("========================================");
  console.log(`🚀 Server running on ${HOST}:${PORT}`);
  console.log(
    `🌍 Environment: ${
      process.env.NODE_ENV || "development"
    }`
  );
  console.log("🔌 Socket.IO initialized");
  console.log("========================================");
});

// ========================================
// UNHANDLED REJECTION
// ========================================

process.on("unhandledRejection", (err) => {
  console.error("❌ Unhandled Rejection:", err);
});

// ========================================
// UNCAUGHT EXCEPTION
// ========================================

process.on("uncaughtException", (err) => {
  console.error("❌ Uncaught Exception:", err);

  console.log(
    "💥 Shutting down server gracefully..."
  );

  clearInterval(seatUnlockInterval);

  server.close(() => {
    process.exit(1);
  });
});

// ========================================
// GRACEFUL SHUTDOWN
// ========================================

function gracefulShutdown(signal) {
  console.log(
    `🛑 ${signal} received. Shutting down server...`
  );

  clearInterval(seatUnlockInterval);

  server.close(() => {
    console.log("✅ Server closed gracefully");
    process.exit(0);
  });

  // Force shutdown after 10 seconds
  setTimeout(() => {
    console.error(
      "⚠️ Forced shutdown after timeout"
    );

    process.exit(1);
  }, 10000);
}

// ========================================
// SHUTDOWN SIGNALS
// ========================================

process.on("SIGINT", () => {
  gracefulShutdown("SIGINT");
});

process.on("SIGTERM", () => {
  gracefulShutdown("SIGTERM");
});