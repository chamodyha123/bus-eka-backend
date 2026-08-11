const express = require("express");
const router = express.Router();

const authController = require("../controllers/authController");
const { authenticate } = require("../middleware/authMiddleware");

// PUBLIC ROUTES
router.post("/register", authController.register);
router.post("/login", authController.login);

// PROTECTED PROFILE ROUTES
router.get("/profile", authenticate, authController.getProfile);
router.put("/profile", authenticate, authController.updateProfile);
router.post("/change-password", authenticate, authController.changePassword);

module.exports = router;