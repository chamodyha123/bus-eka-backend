// Load .env BEFORE importing app/controllers/jobs because they read process.env at startup.
require("dotenv").config();

const http = require("http");
const { Server: SocketIOServer } = require("socket.io");
const app = require("./app");
const { startBackgroundJobs } = require("./jobs/backgroundJobs");

const PORT = Number(process.env.PORT || 5000);
const HOST = process.env.HOST || "0.0.0.0";

const httpServer = http.createServer(app);

const configuredOrigins = String(
  process.env.CORS_ORIGINS || process.env.FRONTEND_URL || ""
)
  .split(",")
  .map((value) => value.trim())
  .filter(Boolean);

const defaultOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:5173",
  "https://bus-eka-frontend.vercel.app",
];

const socketOrigins = [
  ...new Set([...configuredOrigins, ...defaultOrigins]),
];

const io = new SocketIOServer(httpServer, {
  cors: {
    origin: socketOrigins.length ? socketOrigins : true,
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports: ["websocket", "polling"],
});

app.set("io", io);

io.on("connection", (socket) => {
  console.log(`🔌 Socket connected: ${socket.id}`);

  socket.on("joinBus", (busId) => {
    if (busId !== undefined && busId !== null) {
      socket.join(`bus:${busId}`);
    }
  });

  socket.on("leaveBus", (busId) => {
    if (busId !== undefined && busId !== null) {
      socket.leave(`bus:${busId}`);
    }
  });

  socket.on("joinTrip", (tripId) => {
    if (tripId !== undefined && tripId !== null) {
      socket.join(`trip:${tripId}`);
    }
  });

  socket.on("leaveTrip", (tripId) => {
    if (tripId !== undefined && tripId !== null) {
      socket.leave(`trip:${tripId}`);
    }
  });

  socket.on("disconnect", (reason) => {
    console.log(`🔌 Socket disconnected: ${socket.id} (${reason})`);
  });
});

httpServer.listen(PORT, HOST, async () => {
  console.log("========================================");
  console.log("🚌 BUS EKA BACKEND");
  console.log("========================================");
  console.log(`🚀 Server running on ${HOST}:${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`🌐 CORS origins: ${socketOrigins.join(", ")}`);
  console.log("🔌 Socket.IO initialized");
  console.log("========================================");

  try {
    await startBackgroundJobs();
  } catch (error) {
    // Do not kill the HTTP server because a background job failed.
    console.error("❌ Background jobs failed to start:", error);
  }
});

httpServer.on("error", (error) => {
  console.error("❌ HTTP server error:", error);
});

async function shutdown(signal) {
  console.log(`\n🛑 ${signal} received. Shutting down...`);

  io.close();
  httpServer.close(() => {
    console.log("✅ HTTP server closed.");
    process.exit(0);
  });
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
