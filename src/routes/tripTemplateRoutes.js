const express = require("express");
const router = express.Router();

const tripTemplateController = require("../controllers/tripTemplateController");
const { authenticate } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

// ======================================================
// MIDDLEWARE SHORTCUT
// ======================================================
const protectAdminOwner = [
  authenticate,
  authorizeRoles("admin", "owner")
];

// ======================================================
// GET ALL TEMPLATES
// ======================================================
router.get(
  "/",
  protectAdminOwner,
  tripTemplateController.getTripTemplates
);

// ======================================================
// CREATE TEMPLATE
// ======================================================
router.post(
  "/",
  protectAdminOwner,
  tripTemplateController.createTripTemplate
);

// ======================================================
// GET TEMPLATE BY ID
// ======================================================
router.get(
  "/:id",
  protectAdminOwner,
  tripTemplateController.getTripTemplateById
);

// ======================================================
// UPDATE TEMPLATE
// ======================================================
router.put(
  "/:id",
  protectAdminOwner,
  tripTemplateController.updateTripTemplate
);

// ======================================================
// DELETE TEMPLATE
// ======================================================
router.delete(
  "/:id",
  protectAdminOwner,
  tripTemplateController.deleteTripTemplate
);

module.exports = router;