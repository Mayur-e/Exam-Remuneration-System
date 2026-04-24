const express = require("express");
const router = express.Router();
const authController = require("../../controllers/authController");
const googleAuthController = require("../../controllers/googleAuthController");
const auth = require("../../middleware/authMiddleware");
const { loginValidation, changePasswordValidation } = require("../../middleware/validationMiddleware");

router.post("/login", loginValidation, authController.login);

router.post("/change-password", auth, changePasswordValidation, authController.changePassword);
router.post("/set-password", auth, authController.setPassword);
router.get("/me", auth, authController.getMe);

// Google Auth routes
router.post("/google/check", googleAuthController.checkGoogleUser);

module.exports = router;
