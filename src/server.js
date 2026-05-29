const http = require("http");
const app = require("./app");
const { initSocket } = require("./sockets/socket");

const PORT = process.env.PORT || 5000;

try {

  const server = http.createServer(app);

  // INIT SOCKET.IO
  initSocket(server);

  server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });

  // HANDLE UNHANDLED ERRORS
  process.on("unhandledRejection", (err) => {
    console.error("Unhandled Rejection:", err.message);
  });

  process.on("uncaughtException", (err) => {
    console.error("Uncaught Exception:", err.message);
  });

} catch (err) {
  console.error("Server failed to start:", err.message);
}