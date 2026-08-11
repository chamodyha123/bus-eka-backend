const express = require("express");
const router = express.Router();

const seatController = require("../controllers/seatController");
const { authenticate } = require("../middleware/authMiddleware");

// Get seats for a specific trip
router.get("/trip/:tripId", seatController.getTripSeats);

// Get seats for a bus (legacy/fallback)
router.get("/bus/:busId", seatController.getBusSeats);
router.get("/:busId", seatController.getBusSeats);

// Lock a seat
router.post("/lock", authenticate, seatController.lockSeat);

// Unlock a seat manually
router.post("/unlock", authenticate, seatController.unlockSeat);

module.exports = router;