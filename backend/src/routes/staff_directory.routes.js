const express = require('express');
const router = express.Router();
const { createAuthMiddleware } = require('../middleware/enhancedAuthMiddleware');
const ctrl = require('../controllers/staff_directory.controller');

// Authentication middleware for staff directory routes
const authenticate = createAuthMiddleware({
  allowQueryToken: false,
  auditLog: true
});

// All staff directory routes require authentication
router.use(authenticate);

// GET /api/staff-directory/search?q=<name>&type=faculty|all
// Accessible to all authenticated users
router.get('/search', ctrl.search);

module.exports = router;
