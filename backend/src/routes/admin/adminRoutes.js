const express = require("express");
const router = express.Router();
const auth = require("../../middleware/authMiddleware");
const role = require("../../middleware/roleMiddleware");
const adminController = require("../../controllers/admin.controller");

// Dashboard
router.get("/dashboard/stats", auth, role(["ADMIN"]), adminController.getDashboardStats);

// Claims Management
router.get("/claims", auth, role(["ADMIN"]), adminController.getAllClaims);
router.get("/claims/:id", auth, role(["ADMIN"]), adminController.getClaimDetails);
router.post("/claims/:id/reject", auth, role(["ADMIN"]), adminController.rejectClaim);
router.post("/claims/:id/send-back", auth, role(["ADMIN"]), adminController.sendBackClaim);

// External Supervision
router.get("/external/examiners", auth, role(["ADMIN"]), adminController.getExternalExaminers);
router.get("/external/links", auth, role(["ADMIN"]), adminController.getExternalLinkStats);
router.get("/external/documents/:id", auth, role(["ADMIN"]), adminController.getExternalDocuments);

// Faculty Oversight
router.get("/faculty", auth, role(["ADMIN"]), adminController.listAllFaculty);
router.get("/faculty/:id", auth, role(["ADMIN"]), adminController.getFacultyProfile);

// Accountant Audit
router.get("/accountant/audit", auth, role(["ADMIN"]), adminController.getAccountantAudit);
router.get("/accountant/:id/actions", auth, role(["ADMIN"]), adminController.getAccountantActions);

// Audit Logs
router.get("/audit-logs", auth, role(["ADMIN"]), adminController.getAuditLogs);

module.exports = router;
