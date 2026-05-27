const express = require("express");
const router = express.Router();

const crowdController = require("../controllers/crowdController");

router.post("/report", crowdController.reportCrowd);

router.get("/:busId", crowdController.getBusCrowd);

module.exports = router;