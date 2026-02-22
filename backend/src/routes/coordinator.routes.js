const express = require('express');
const router = express.Router();
const coordinatorController = require('../controllers/coordinator.controller');
const auth = require('../middleware/authMiddleware');
const role = require('../middleware/roleMiddleware');

// All routes require login
router.use(auth);

// Shared Routes (Faculty can view courses to select)
// Allow Faculty to access courses
router.get('/courses', role(['FACULTY']), coordinatorController.getDepartmentCourses);

// Coordinator Assignment
router.post('/assign', role(['FACULTY']), coordinatorController.assignCoordinator);
router.get('/assignments', role(['FACULTY']), coordinatorController.getMyAssignments);
router.delete('/assignments/:assignmentId/revoke', role(['FACULTY']), coordinatorController.revokeSelfCoordinator);

// Coordinator Actions
router.get('/claims', role(['FACULTY']), coordinatorController.getCoordinatorClaims);
router.post('/verify', role(['FACULTY']), coordinatorController.verifyClaim);
router.post('/reject', role(['FACULTY']), coordinatorController.rejectClaim);
router.post('/submit-billing', role(['FACULTY']), coordinatorController.submitToBilling);

module.exports = router;
