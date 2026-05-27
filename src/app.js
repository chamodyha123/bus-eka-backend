const express = require("express");
const cors = require("cors");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
const authRoutes = require("./routes/authRoutes");
app.use("/api/auth", authRoutes);
const busRoutes = require("./routes/busRoutes");
app.use("/api/buses", busRoutes);
const routeRoutes = require("./routes/routeRoutes");
app.use("/api/routes", routeRoutes);
const trackingRoutes = require("./routes/trackingRoutes");
app.use("/api/tracking", trackingRoutes);
const crowdRoutes = require("./routes/crowdRoutes");
app.use("/api/crowd", crowdRoutes);
const emergencyRoutes = require("./routes/emergencyRoutes");
app.use("/api/emergency", emergencyRoutes);
const etaRoutes = require("./routes/etaRoutes");
app.use("/api/eta", etaRoutes);
const notificationRoutes = require("./routes/notificationRoutes");
app.use("/api/notifications", notificationRoutes);

// Health check
app.get("/", (req, res) => {
  res.send("Bus Eka Backend is Running 🚍");
});

module.exports = app;