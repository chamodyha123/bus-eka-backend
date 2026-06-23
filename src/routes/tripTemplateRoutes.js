const express = require("express");
const router = express.Router();

const tripTemplateController = require("../controllers/tripTemplateController");
const { authenticate } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

// GET ALL TEMPLATES
router.get(
  "/",
  authenticate,
  authorizeRoles("admin", "owner"),
  tripTemplateController.getTripTemplates
);

// GET SINGLE TEMPLATE
router.get(
  "/:id",
  authenticate,
  authorizeRoles("admin", "owner"),
  tripTemplateController.getTripTemplateById
);

// CREATE TEMPLATE
router.post(
  "/",
  authenticate,
  authorizeRoles("admin", "owner"),
  tripTemplateController.createTripTemplate
);

// UPDATE TEMPLATE
router.put(
  "/:id",
  authenticate,
  authorizeRoles("admin", "owner"),
  tripTemplateController.updateTripTemplate
);

// DELETE TEMPLATE
router.delete(
  "/:id",
  authenticate,
  authorizeRoles("admin", "owner"),
  tripTemplateController.deleteTripTemplate
);

// GENERATE TODAY TRIPS FROM TEMPLATES
router.post(
  "/generate/today",
  authenticate,
  authorizeRoles("admin", "owner"),
  tripTemplateController.generateTodayTripsFromTemplates
);

module.exports = router;