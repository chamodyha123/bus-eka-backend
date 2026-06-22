const express = require("express");
const router = express.Router();

const emergencyController = require("../controllers/emergencyController");
const { authenticate } = require("../middleware/authMiddleware");

// CREATE EMERGENCY REPORT
router.post(
  "/",
  authenticate,
  emergencyController.createEmergencyReport
);

// GET ALL EMERGENCY REPORTS
router.get(
  "/",
  authenticate,
  emergencyController.getEmergencyReports
);

module.exports = router;