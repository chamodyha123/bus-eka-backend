const express = require("express");
const router = express.Router();

const trackingController = require("../controllers/trackingController");

const { authenticate } = require("../middleware/authMiddleware");

router.post(
  "/update",
  authenticate,
  trackingController.updateLocation
);

router.get(
  "/:busId",
  trackingController.getLatestLocation
);

module.exports = router;