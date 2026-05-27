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

// Health check
app.get("/", (req, res) => {
  res.send("Bus Eka Backend is Running 🚍");
});

module.exports = app;