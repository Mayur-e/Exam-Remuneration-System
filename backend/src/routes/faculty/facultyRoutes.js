const router = require("express").Router();
const auth = require("../../middleware/authMiddleware");
const role = require("../../middleware/roleMiddleware");
const ctrl = require("../../controllers/faculty.controller");
const { createExamValidation, submitClaimValidation, idParamValidation } = require("../../middleware/validationMiddleware");

// All faculty routes are protected
router.use(auth, role(["FACULTY"]));

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
router.get("/exams/:id/bill", idParamValidation, ctrl.getBillSummary);
router.get("/drafts", ctrl.listDraftClaims);
router.delete("/drafts/:id", idParamValidation, ctrl.deleteDraft);
router.get("/exams/:id/summary", idParamValidation, ctrl.getExamSummary);

router.post("/exams/:id/external-link", idParamValidation, ctrl.generateExternalLink);

module.exports = router;
