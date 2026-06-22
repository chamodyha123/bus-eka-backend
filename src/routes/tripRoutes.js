const express = require("express");
const router = express.Router();

const tripController = require("../controllers/tripController");
const { authenticate } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

// ======================================================
// SEARCH TRIPS
// passenger/owner/admin
// /api/trips/search?start=Colombo&end=Kandy&date=2026-06-22
// ======================================================
router.get(
  "/search",
  authenticate,
  tripController.searchTrips
);

// ======================================================
// GET ALL TRIPS
// ======================================================
router.get(
  "/",
  authenticate,
  tripController.getTrips
);

// ======================================================
// GET TRIPS BY BUS
// ======================================================
router.get(
  "/bus/:busId",
  authenticate,
  tripController.getTripsByBus
);

// ======================================================
// GET SINGLE TRIP
// ======================================================
router.get(
  "/:id",
  authenticate,
  tripController.getTripById
);

// ======================================================
// CREATE TRIP
// owner/admin only
// ======================================================
router.post(
  "/",
  authenticate,
  authorizeRoles("admin", "owner"),
  tripController.createTrip
);

// ======================================================
// UPDATE TRIP
// owner/admin only
// ======================================================
router.put(
  "/:id",
  authenticate,
  authorizeRoles("admin", "owner"),
  tripController.updateTrip
);

// ======================================================
// DELETE TRIP
// owner/admin only
// ======================================================
router.delete(
  "/:id",
  authenticate,
  authorizeRoles("admin", "owner"),
  tripController.deleteTrip
);

module.exports = router;