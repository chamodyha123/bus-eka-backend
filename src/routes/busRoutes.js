const express = require("express");
const router = express.Router();

const busController = require("../controllers/busController");
const { authenticate } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

// ======================================================
// GET ALL BUSES
// ======================================================
router.get("/", authenticate, busController.getBuses);

// ======================================================
// GET BUSES BY ROUTE
// ======================================================
router.get("/route/:routeId", authenticate, busController.getBusesByRoute);

// ======================================================
// GET SINGLE BUS
// ======================================================
router.get("/:id", authenticate, busController.getBusById);

// ======================================================
// CREATE BUS
// ======================================================
router.post(
  "/",
  authenticate,
  authorizeRoles("admin", "owner"),
  busController.createBus
);

// ======================================================
// UPDATE BUS
// ======================================================
router.put(
  "/:id",
  authenticate,
  authorizeRoles("admin", "owner"),
  busController.updateBus
);

// ======================================================
// DELETE BUS
// ======================================================
router.delete(
  "/:id",
  authenticate,
  authorizeRoles("admin", "owner"),
  busController.deleteBus
);

module.exports = router;