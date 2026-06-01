const express = require("express");
const router = express.Router();

const controller = require("../controllers/paymentController");

// CREATE PAYMENT (FRONTEND REDIRECT DATA)
router.post("/create", controller.createPayment);

// PAYHERE CALLBACKS
router.post("/notify", controller.payhereNotify);

router.post("/success", (req, res) => {
  res.send("Payment Success");
});

router.post("/fail", (req, res) => {
  res.send("Payment Failed");
});

module.exports = router;