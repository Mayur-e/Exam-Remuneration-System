const express = require('express');
const router = express.Router();
const queryController = require('../controllers/query.controller');
const authenticateToken = require('../middleware/authMiddleware');

// All routes require authentication
router.use(authenticateToken);

// Faculty routes
router.post('/queries', queryController.createQuery);
router.get('/queries', queryController.getQueries);
router.get('/queries/:id', queryController.getQueryDetails);
router.put('/queries/:id', queryController.updateQuery);
router.delete('/queries/:id', queryController.deleteQuery);

// Accountant/Admin routes
router.post('/queries/:id/respond', queryController.respondToQuery);
router.patch('/queries/:id/status', queryController.updateQueryStatus);
router.get('/queries-stats', queryController.getQueryStats);

module.exports = router;
