const express = require("express");
const router = express.Router();

const seatController = require("../controllers/seatController");

router.get(
  "/:busId",
  seatController.getBusSeats
);

module.exports = router;