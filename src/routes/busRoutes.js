const express = require("express");
const router = express.Router();

const busController = require("../controllers/busController");

router.post("/", busController.createBus);
router.get("/", busController.getBuses);

module.exports = router;