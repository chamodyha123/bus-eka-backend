const express = require("express");
const router = express.Router();

const routeController = require("../controllers/routeController");
const { authenticate } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

// ======================================================
// VIEW ROUTES
// ======================================================
router.get("/", authenticate, routeController.getRoutes);
router.get("/search", authenticate, routeController.searchRoutes);
router.get("/:id", authenticate, routeController.getRouteById);

// ======================================================
// OWNER / ADMIN ROUTE MANAGEMENT
// ======================================================
router.post(
  "/",
  authenticate,
  authorizeRoles("admin", "owner"),
  routeController.createRoute
);

router.put(
  "/:id",
  authenticate,
  authorizeRoles("admin", "owner"),
  routeController.updateRoute
);

router.delete(
  "/:id",
  authenticate,
  authorizeRoles("admin", "owner"),
  routeController.deleteRoute
);

module.exports = router;