const http = require("http");

const app = require("./app");

const {
  startBackgroundJobs,
} = require("./jobs/backgroundJobs");

const {
  Server: SocketIOServer,
} = require("socket.io");

const PORT = Number(
  process.env.PORT || 8080
);

const HOST = "0.0.0.0";

const httpServer =
  http.createServer(app);

/**
 * Socket.IO
 */
const io = new SocketIOServer(
  httpServer,
  {
    cors: {
      origin: "*",
      methods: [
        "GET",
        "POST",
        "PUT",
        "PATCH",
        "DELETE",
      ],
    },
  }
);

/**
 * Make Socket.IO available
 * throughout the application.
 */
app.set("io", io);

/**
 * Socket.IO connections.
 */
io.on("connection", (socket) => {
  console.log(
    `🔌 Socket connected: ${socket.id}`
  );

  socket.on(
    "joinBus",
    (busId) => {
      if (busId) {
        socket.join(`bus:${busId}`);

        console.log(
          `🚌 Socket ${socket.id} joined bus:${busId}`
        );
      }
    }
  );

  socket.on(
    "leaveBus",
    (busId) => {
      if (busId) {
        socket.leave(`bus:${busId}`);
      }
    }
  );

  socket.on(
    "joinTrip",
    (tripId) => {
      if (tripId) {
        socket.join(`trip:${tripId}`);

        console.log(
          `🎫 Socket ${socket.id} joined trip:${tripId}`
        );
      }
    }
  );

  socket.on(
    "leaveTrip",
    (tripId) => {
      if (tripId) {
        socket.leave(`trip:${tripId}`);
      }
    }
  );

  socket.on(
    "disconnect",
    () => {
      console.log(
        `🔌 Socket disconnected: ${socket.id}`
      );
    }
  );
});

/**
 * Start HTTP server.
 */
httpServer.listen(
  PORT,
  HOST,
  async () => {
    console.log(
      "========================================"
    );

    console.log(
      "🚌 BUS EKA BACKEND"
    );

    console.log(
      "========================================"
    );

    console.log(
      `🚀 Server running on ${HOST}:${PORT}`
    );

    console.log(
      `🌍 Environment: ${
        process.env.NODE_ENV || "development"
      }`
    );

    console.log(
      "🔌 Socket.IO initialized"
    );

    console.log(
      "========================================"
    );

    /**
     * Start cron/background jobs.
     */
    await startBackgroundJobs();
  }
);

/**
 * Handle server errors.
 */
httpServer.on(
  "error",
  (error) => {
    console.error(
      "❌ HTTP server error:",
      error
    );
  }
);

/**
 * Graceful shutdown.
 */
async function shutdown(signal) {
  console.log(
    `\n🛑 ${signal} received. Shutting down...`
  );

  httpServer.close(() => {
    console.log(
      "✅ HTTP server closed."
    );
  });
}

process.on(
  "SIGTERM",
  () => shutdown("SIGTERM")
);

process.on(
  "SIGINT",
  () => shutdown("SIGINT")
);