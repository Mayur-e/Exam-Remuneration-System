const express = require("express");
const router = express.Router();
const authController = require("../../controllers/authController");
const googleAuthController = require("../../controllers/googleAuthController");
const auth = require("../../middleware/authMiddleware");
const { loginValidation, registerValidation, changePasswordValidation } = require("../../middleware/validationMiddleware");

router.post("/login", loginValidation, authController.login);
router.post("/register", registerValidation, authController.registerFaculty);
router.post("/change-password", auth, changePasswordValidation, authController.changePassword);
router.post("/set-password", auth, authController.setPassword);

// Google Auth routes
router.post("/google/check", googleAuthController.checkGoogleUser);
router.post("/google/register", googleAuthController.registerGoogleUser);

module.exports = router;
