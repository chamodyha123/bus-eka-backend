const express = require("express");
const router = express.Router();
const ticketController = require("../controllers/ticketController");
const { authenticate } = require("../middleware/authMiddleware");

router.post("/verify", authenticate, ticketController.verifyTicket);

module.exports = router;