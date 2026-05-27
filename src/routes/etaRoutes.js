const express = require("express");
const router = express.Router();

const etaController = require("../controllers/etaController");

router.post("/calculate", etaController.calculateETA);

module.exports = router;