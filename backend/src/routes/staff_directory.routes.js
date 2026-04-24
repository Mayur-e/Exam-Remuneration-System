const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const ctrl = require('../controllers/staff_directory.controller');

// GET /api/staff-directory/search?q=<name>&type=faculty|all
// Accessible to all authenticated users
router.get('/search', auth, ctrl.search);

module.exports = router;
