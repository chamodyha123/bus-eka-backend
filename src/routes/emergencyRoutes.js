const express = require("express");
const router = express.Router();

const emergencyController = require("../controllers/emergencyController");

router.post("/", emergencyController.createEmergency);

router.get("/", emergencyController.getEmergencies);

module.exports = router;