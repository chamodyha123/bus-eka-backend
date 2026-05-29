const express = require("express");
const router = express.Router();

const adminController = require("../controllers/adminController");

const { authenticate } = require("../middleware/authMiddleware");
const admin = require("../middleware/adminMiddleware");

// ALL ADMIN ROUTES PROTECTED
router.use(authenticate);
router.use(admin);

// USERS
router.get("/users", adminController.getUsers);

// BUSES
router.get("/buses", adminController.getBuses);

// ROUTES
router.get("/routes", adminController.getRoutes);

// EMERGENCY
router.get("/emergency", adminController.getEmergencyReports);

// ANALYTICS (basic now, expand later)
router.get("/stats", adminController.getStats);

module.exports = router;