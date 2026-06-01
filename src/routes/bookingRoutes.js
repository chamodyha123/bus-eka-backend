const express = require("express");
const router = express.Router();

const bookingController = require("../controllers/bookingController");
const { authenticate } = require("../middleware/authMiddleware");

// CREATE BOOKING
router.post("/", authenticate, bookingController.createBooking);

// GET USER BOOKINGS
router.get("/", authenticate, bookingController.getUserBookings);

// CANCEL BOOKING
router.delete("/:bookingId", authenticate, bookingController.cancelBooking);

module.exports = router;