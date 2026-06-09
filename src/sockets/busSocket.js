const { getIO } = require("./socket");

// SEND BUS UPDATE
const sendBusLocationUpdate = (busId, data) => {
  const io = getIO();

  io.to(`bus_${busId}`).emit("busLocationUpdated", {
    busId,
    ...data
  });
};

module.exports = {
  sendBusLocationUpdate
  
};