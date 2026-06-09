const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const morgan = require("morgan");

// ROUTES
const authRoutes = require("./routes/authRoutes");
const busRoutes = require("./routes/busRoutes");
const routeRoutes = require("./routes/routeRoutes");
const trackingRoutes = require("./routes/trackingRoutes");
const crowdRoutes = require("./routes/crowdRoutes");
const emergencyRoutes = require("./routes/emergencyRoutes");
const etaRoutes = require("./routes/etaRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const adminRoutes = require("./routes/adminRoutes");
const seatRoutes = require("./routes/seatRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const ticketRoutes = require("./routes/ticketRoutes");




// CREATE APP FIRST (IMPORTANT)
const app = express();

// MIDDLEWARE
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));
app.use(helmet());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});

app.use(limiter);

// ROUTES
app.use("/api/auth", authRoutes);
app.use("/api/buses", busRoutes);
app.use("/api/routes", routeRoutes);
app.use("/api/tracking", trackingRoutes);
app.use("/api/crowd", crowdRoutes);
app.use("/api/emergency", emergencyRoutes);
app.use("/api/eta", etaRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/seats", seatRoutes);

app.use("/api/tickets", ticketRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/payment", require("./routes/paymentRoutes"));

// TEST ROUTE
app.get("/", (req, res) => {
  res.send("Bus Eka Backend Running 🚍");
});

// 404 HANDLER
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found"
  });
});

module.exports = app;