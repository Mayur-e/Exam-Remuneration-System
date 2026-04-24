const express = require('express');
const router = express.Router();
const { createAuthMiddleware, authorize } = require('../middleware/enhancedAuthMiddleware');
const coordinatorController = require('../controllers/coordinator.controller');

// Authentication middleware for coordinator routes
const authenticate = createAuthMiddleware({
  allowQueryToken: false,
  auditLog: true
});

// All coordinator routes require authentication
router.use(authenticate);

// Shared Routes (Faculty can view courses to select)
// Allow Faculty to access courses
router.get('/courses', authorize(['FACULTY']), coordinatorController.getDepartmentCourses);

// Coordinator Assignment
router.post('/assign', authorize(['FACULTY']), coordinatorController.assignCoordinator);
router.get('/assignments', authorize(['FACULTY']), coordinatorController.getMyAssignments);
router.delete('/assignments/:assignmentId/revoke', authorize(['FACULTY']), coordinatorController.revokeSelfCoordinator);

// Coordinator Actions
router.get('/claims', authorize(['FACULTY']), coordinatorController.getCoordinatorClaims);
router.get('/claims/:id', authorize(['FACULTY']), coordinatorController.getCoordinatorClaimDetails);
router.post('/verify', authorize(['FACULTY']), coordinatorController.verifyClaim);
router.post('/reject', authorize(['FACULTY']), coordinatorController.rejectClaim);
router.post('/submit-billing', authorize(['FACULTY']), coordinatorController.submitToBilling);

module.exports = router;
