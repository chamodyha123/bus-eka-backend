const express = require("express");
const router = express.Router();

const busController = require("../controllers/busController");

const { authenticate } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

// CREATE BUS
router.post(
  "/",
  authenticate,
  authorizeRoles("admin", "owner"),
  busController.createBus
);

// GET BUSES
router.get(
  "/",
  authenticate,
  busController.getBuses
);

module.exports = router;