const express = require("express");
const router = express.Router();
const authController = require("../../controllers/authController");
const googleAuthController = require("../../controllers/googleAuthController");
const { loginValidation, changePasswordValidation } = require("../../middleware/validationMiddleware");
const { createAuthMiddleware, authorize } = require("../../middleware/enhancedAuthMiddleware");
const { loginLimiter, sensitiveOperationLimiter } = require("../../middleware/rateLimitingMiddleware");

const authenticate = createAuthMiddleware({
  allowQueryToken: false, // Don't allow tokens in query params for auth routes
  auditLog: true
});

/**
 * Public Routes (no authentication required)
 */

// Login endpoint - with strict rate limiting (5 attempts per 15 minutes)
router.post("/login", loginLimiter, loginValidation, authController.login);

// Google auth check - public endpoint
router.post("/google/check", googleAuthController.checkGoogleUser);

/**
 * Protected Routes (authentication required)
 */

// Get current user info
router.get("/me", authenticate, authController.getMe);

// Change password - requires authentication + strict rate limiting
router.post("/change-password", authenticate, sensitiveOperationLimiter, changePasswordValidation, authController.changePassword);

// Set password (for first-time users) - requires authentication + strict rate limiting
router.post("/set-password", authenticate, sensitiveOperationLimiter, authController.setPassword);

module.exports = router;
