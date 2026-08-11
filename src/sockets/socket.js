const { Server } = require("socket.io");

let io;

const initSocket = (server) => {
  const allowedOrigins = [
    process.env.FRONTEND_URL,
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:5173"
  ].filter(Boolean);

  io = new Server(server, {
    cors: {
      origin: allowedOrigins,
      credentials: true,
      methods: ["GET", "POST"]
    },

    transports: ["websocket", "polling"]
  });

  console.log("🔌 Socket.IO initialized");

  io.on("connection", (socket) => {
    console.log("🟢 User connected:", socket.id);

    // ========================================
    // JOIN BUS ROOM
    // ========================================

    socket.on("joinBusRoom", (busId) => {
      if (!busId) {
        console.log("⚠️ joinBusRoom called without busId");
        return;
      }

      const roomName = `bus_${busId}`;

      socket.join(roomName);

      console.log(
        `🚌 Socket ${socket.id} joined ${roomName}`
      );

      socket.emit("joinedBusRoom", {
        success: true,
        busId,
        room: roomName
      });
    });

    // ========================================
    // LEAVE BUS ROOM
    // ========================================

    socket.on("leaveBusRoom", (busId) => {
      if (!busId) {
        return;
      }

      const roomName = `bus_${busId}`;

      socket.leave(roomName);

      console.log(
        `🚪 Socket ${socket.id} left ${roomName}`
      );
    });

    // ========================================
    // OPTIONAL: JOIN TRIP ROOM
    // ========================================

    socket.on("joinTripRoom", (tripId) => {
      if (!tripId) {
        return;
      }

      const roomName = `trip_${tripId}`;

      socket.join(roomName);

      console.log(
        `🚍 Socket ${socket.id} joined ${roomName}`
      );
    });

    // ========================================
    // LEAVE TRIP ROOM
    // ========================================

    socket.on("leaveTripRoom", (tripId) => {
      if (!tripId) {
        return;
      }

      const roomName = `trip_${tripId}`;

      socket.leave(roomName);

      console.log(
        `🚪 Socket ${socket.id} left ${roomName}`
      );
    });

    // ========================================
    // DISCONNECT
    // ========================================

    socket.on("disconnect", (reason) => {
      console.log(
        `🔴 User disconnected: ${socket.id} | Reason: ${reason}`
      );
    });

    // ========================================
    // SOCKET ERROR
    // ========================================

    socket.on("error", (error) => {
      console.error(
        `❌ Socket error (${socket.id}):`,
        error
      );
    });
  });

  return io;
};

// ========================================
// GET SOCKET.IO INSTANCE
// ========================================

const getIO = () => {
  if (!io) {
    throw new Error(
      "Socket.IO has not been initialized. Call initSocket(server) first."
    );
  }

  return io;
};

module.exports = {
  initSocket,
  getIO
};