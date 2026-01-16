const router = require("express").Router();
const auth = require("../../middleware/authMiddleware");
const role = require("../../middleware/roleMiddleware");
const ctrl = require("../../controllers/faculty.controller");

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
router.post("/exams", ctrl.createExam);
router.get("/exams", ctrl.listMyExams);
router.get("/exams/:id", ctrl.getExamById);
router.put("/exams/:id", ctrl.updateExam);
router.post("/exams/:id/submit", ctrl.submitExam);
router.post("/exams/:id/resubmit", ctrl.resubmitClaim);
router.post("/exams/:id/staff", ctrl.addExamStaff);
router.get("/exams/:id/bill", ctrl.getBillSummary);
router.get("/drafts", ctrl.listDraftClaims);
router.delete("/drafts/:id", ctrl.deleteDraft);
router.get("/exams/:id/summary", ctrl.getExamSummary);

router.post("/exams/:id/external-link", ctrl.generateExternalLink);

module.exports = router;
