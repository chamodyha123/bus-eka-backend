const { Server } = require("socket.io");

let io;

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "*"
    }
  });

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // Join bus-specific room
    socket.on("joinBusRoom", (busId) => {
      socket.join(`bus_${busId}`);
      console.log(`Socket ${socket.id} joined bus_${busId}`);
    });

    // Optional: leave room
    socket.on("leaveBusRoom", (busId) => {
      socket.leave(`bus_${busId}`);
      console.log(`Socket ${socket.id} left bus_${busId}`);
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });
};

// Getter for emitting events from controllers
const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized");
  }
  return io;
};

module.exports = {
  initSocket,
  getIO
};