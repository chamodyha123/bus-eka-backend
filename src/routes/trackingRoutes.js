const express = require("express");
const router = express.Router();

const trackingController = require("../controllers/trackingController");

router.post("/update", trackingController.updateLocation);

router.get("/:busId", trackingController.getLatestLocation);

module.exports = router;