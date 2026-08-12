const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const morgan = require("morgan");

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
const tripRoutes = require("./routes/tripRoutes");
const tripTemplateRoutes = require("./routes/tripTemplateRoutes");

const app = express();

// ========================================
// CORS
// ========================================
const configuredOrigins = String(
  process.env.CORS_ORIGINS || process.env.FRONTEND_URL || ""
)
  .split(",")
  .map((value) => value.trim())
  .filter(Boolean);

const allowedOrigins = [
  ...new Set([
    ...configuredOrigins,
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:5173",
    "https://bus-eka-frontend.vercel.app",
  ]),
];

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.warn(`❌ CORS blocked: ${origin}`);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Accept",
    ],
  })
);

app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: Number(process.env.RATE_LIMIT_MAX || 300),
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests. Please try again later.",
  },
});

app.use(limiter);

// ========================================
// ROUTES
// ========================================
// Primary API namespace.
const apiRoutes = {
  auth: authRoutes,
  buses: busRoutes,
  routes: routeRoutes,
  tracking: trackingRoutes,
  crowd: crowdRoutes,
  emergency: emergencyRoutes,
  eta: etaRoutes,
  notifications: notificationRoutes,
  admin: adminRoutes,
  seats: seatRoutes,
  tickets: ticketRoutes,
  bookings: bookingRoutes,
  payment: paymentRoutes,
  trips: tripRoutes,
  "trip-templates": tripTemplateRoutes,
};

for (const [name, router] of Object.entries(apiRoutes)) {
  app.use(`/api/${name}`, router);
}

// Backward-compatible aliases.
// These are useful if an older frontend calls /auth/login instead of /api/auth/login.
for (const [name, router] of Object.entries(apiRoutes)) {
  app.use(`/${name}`, router);
}

// ========================================
// HEALTH / INFO
// ========================================
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Bus Eka Backend Running 🚍",
    environment: process.env.NODE_ENV || "development",
    apiBase: "/api",
    socketPath: "/socket.io",
  });
});

app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    status: "healthy",
    timestamp: new Date().toISOString(),
  });
});

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    status: "healthy",
    timestamp: new Date().toISOString(),
  });
});

// Avoid noisy 404s from Azure/App Service warm-up probes.
app.get("/robots933456.txt", (req, res) => {
  res.type("text/plain").send("User-agent: *\nDisallow:");
});

// ========================================
// 404
// ========================================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    path: req.originalUrl,
    hint: "Use /api/<resource> or the supported legacy /<resource> alias.",
  });
});

// ========================================
// ERROR HANDLER
// ========================================
app.use((err, req, res, next) => {
  console.error("❌ API Error:", err);

  if (err.message === "Not allowed by CORS") {
    return res.status(403).json({
      success: false,
      message: "CORS policy blocked this request.",
    });
  }

  return res.status(err.status || 500).json({
    success: false,
    message:
      process.env.NODE_ENV === "production"
        ? "Internal server error"
        : err.message,
  });
});

module.exports = app;
