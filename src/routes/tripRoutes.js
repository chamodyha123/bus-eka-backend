const express = require("express");
const router = express.Router();

const tripController = require("../controllers/tripController");
const { authenticate } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

// SEARCH
router.get("/search", authenticate, tripController.searchTrips);

// GENERATE TRIPS FROM TEMPLATES
router.post(
  "/generate",
  authenticate,
  authorizeRoles("admin", "owner"),
  tripController.generateTripsFromTemplates
);

// GET ALL TRIPS
router.get("/", authenticate, tripController.getTrips);

// GET TRIPS BY BUS
router.get("/bus/:busId", authenticate, tripController.getTripsByBus);

// GET SINGLE TRIP
router.get("/:id", authenticate, tripController.getTripById);

// CREATE MANUAL TRIP
router.post(
  "/",
  authenticate,
  authorizeRoles("admin", "owner"),
  tripController.createTrip
);

// UPDATE TRIP
router.put(
  "/:id",
  authenticate,
  authorizeRoles("admin", "owner"),
  tripController.updateTrip
);

// DELETE TRIP
router.delete(
  "/:id",
  authenticate,
  authorizeRoles("admin", "owner"),
  tripController.deleteTrip
);

module.exports = router;