let io;

const initSocket = (server) => {
  const { Server } = require("socket.io");

  io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  io.on("connection", (socket) => {
    console.log("⚡ Client connected:", socket.id);

    // JOIN BUS ROOM
    socket.on("joinBus", (busId) => {
      socket.join(`bus_${busId}`);
      console.log(`User joined bus_${busId}`);
    });

    // LEAVE BUS ROOM
    socket.on("leaveBus", (busId) => {
      socket.leave(`bus_${busId}`);
      console.log(`User left bus_${busId}`);
    });

    socket.on("disconnect", () => {
      console.log("❌ Client disconnected:", socket.id);
    });
  });

  return io;
};

// GET IO INSTANCE
const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized!");
  }
  return io;
};

module.exports = {
  initSocket,
  getIO
};