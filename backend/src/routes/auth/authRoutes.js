const express = require("express");
const router = express.Router();
const authController = require("../../controllers/authController");
const auth = require("../../middleware/authMiddleware");
const { loginValidation, registerValidation, changePasswordValidation } = require("../../middleware/validationMiddleware");

router.post("/login", loginValidation, authController.login);
router.post("/register", registerValidation, authController.registerFaculty);
router.post("/change-password", auth, changePasswordValidation, authController.changePassword);

module.exports = router;
