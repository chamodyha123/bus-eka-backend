const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/paymentController");
const { authenticate } = require("../middleware/authMiddleware");

// Create PayHere payment request
router.post("/create", authenticate, paymentController.createPayment);

// Mock payment endpoint (For instant demo checkout)
router.post("/mock-pay", authenticate, paymentController.mockPayment);

// PayHere notification webhook
router.post("/notify", paymentController.payhereNotify);

module.exports = router;