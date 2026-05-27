const express = require("express");
const router = express.Router();

const routeController = require("../controllers/routeController");

router.post("/", routeController.createRoute);
router.get("/", routeController.getRoutes);

// SEARCH
router.get("/search", routeController.searchRoutes);

module.exports = router;