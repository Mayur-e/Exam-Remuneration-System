const router = require("express").Router();
const { createAuthMiddleware, authorize } = require("../../middleware/enhancedAuthMiddleware");
const ctrl = require("../../controllers/faculty.controller");
const { createExamValidation, submitClaimValidation, idParamValidation } = require("../../middleware/validationMiddleware");

// Authentication middleware for faculty routes
const authenticate = createAuthMiddleware({
  allowQueryToken: false,
  auditLog: true
});

// All faculty routes are protected - require FACULTY role
router.use(authenticate, authorize(["FACULTY"]));

/**
 * Dashboard
 */
router.get("/dashboard-stats", ctrl.dashboardStats);

/**
 * Profile / Settings
 */
router.get("/profile", ctrl.getProfile);
router.put("/profile", ctrl.updateProfile);

/**
 * Exams / Claims
 */
router.post("/exams", createExamValidation, ctrl.createExam);
router.get("/exams", ctrl.listMyExams);
router.get("/exams/:id", idParamValidation, ctrl.getExamById);
router.put("/exams/:id", idParamValidation, createExamValidation, ctrl.updateExam);
router.post("/exams/:id/submit", idParamValidation, submitClaimValidation, ctrl.submitExam);
router.post("/exams/:id/resubmit", idParamValidation, ctrl.resubmitClaim);
router.post("/exams/:id/staff", idParamValidation, ctrl.addExamStaff);
router.get("/exams/:id/staff", idParamValidation, ctrl.getExamStaff);
router.get("/exams/:id/batch-size", idParamValidation, ctrl.getBatchSize);
router.get("/staff-rates", ctrl.getStaffRates);
router.put("/exams/:examId/staff/:staffId", ctrl.updateExamStaff);
router.delete("/exams/:examId/staff/:staffId", ctrl.deleteExamStaff);
router.get("/exams/:id/bill", idParamValidation, ctrl.getBillSummary);
router.get("/exams/:id/rate-preview", idParamValidation, ctrl.getRatePreview);
router.get("/drafts", ctrl.listDraftClaims);
router.delete("/drafts/:id", idParamValidation, ctrl.deleteDraft);
router.get("/exams/:id/summary", idParamValidation, ctrl.getExamSummary);

router.post("/exams/:id/external-link", idParamValidation, ctrl.generateExternalLink);

// Subject Search
const subjectCtrl = require("../../controllers/subject.controller");
router.get("/subjects", subjectCtrl.searchSubjects);

module.exports = router;
