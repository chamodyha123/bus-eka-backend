const express = require("express");
const router = express.Router();

const seatController = require("../controllers/seatController");

const {
  authenticate
} = require("../middleware/authMiddleware");

// Get all seats of a bus
router.get(
  "/:busId",
  seatController.getBusSeats
);

// Lock a seat
router.post(
  "/lock",
  authenticate,
  seatController.lockSeat
);

// Unlock a seat manually (if you added unlockSeat)
router.post(
  "/unlock",
  authenticate,
  seatController.unlockSeat
);

module.exports = router;