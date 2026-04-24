const express = require("express");
const router = express.Router();
const auth = require("../../middleware/authMiddleware");
const role = require("../../middleware/roleMiddleware");
const adminController = require("../../controllers/admin.controller");
const { idParamValidation, rejectClaimValidation, sendBackClaimValidation } = require("../../middleware/validationMiddleware");
const multer = require("multer");

// Multer: memory storage for Excel/CSV bulk import
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
  fileFilter: (req, file, cb) => {
    const allowed = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv',
      'application/csv'
    ];
    if (allowed.includes(file.mimetype) || file.originalname.match(/\.(xlsx|xls|csv)$/i)) {
      cb(null, true);
    } else {
      cb(new Error('Only Excel (.xlsx, .xls) and CSV files are allowed'));
    }
  }
});

// Dashboard
router.get("/dashboard/stats", auth, role(["ADMIN"]), adminController.getDashboardStats);

// Claims Management
router.get("/claims", auth, role(["ADMIN"]), adminController.getAllClaims);
router.get("/claims/:id", auth, role(["ADMIN"]), idParamValidation, adminController.getClaimDetails);
router.post("/claims/:id/reject", auth, role(["ADMIN"]), idParamValidation, rejectClaimValidation, adminController.rejectClaim);
router.post("/claims/:id/send-back", auth, role(["ADMIN"]), idParamValidation, sendBackClaimValidation, adminController.sendBackClaim);

// External Supervision
router.get("/external/examiners", auth, role(["ADMIN"]), adminController.getExternalExaminers);
router.get("/external/links", auth, role(["ADMIN"]), adminController.getExternalLinkStats);
router.get("/external/documents/:id", auth, role(["ADMIN"]), idParamValidation, adminController.getExternalDocuments);

// Faculty Oversight
router.get("/faculty", auth, role(["ADMIN"]), adminController.listAllFaculty);
router.get("/faculty/:id", auth, role(["ADMIN"]), idParamValidation, adminController.getFacultyProfile);

// Billing Incharge Audit
router.get("/billing-incharge/audit", auth, role(["ADMIN"]), adminController.getBillingInchargeAudit);
router.get("/billing-incharge/:id/actions", auth, role(["ADMIN"]), idParamValidation, adminController.getBillingInchargeActions);

// Audit Logs
router.get("/audit-logs", auth, role(["ADMIN"]), adminController.getAuditLogs);

// Rate Management
router.get("/rates/academic-years", auth, role(["ADMIN"]), adminController.getAcademicYears);
router.get("/rates", auth, role(["ADMIN"]), adminController.getRates);
router.put("/rates", auth, role(["ADMIN"]), adminController.updateRates);
router.post("/rates/clone", auth, role(["ADMIN"]), adminController.cloneRatesToNewYear);

// Subject Count Management
const subjectController = require("../../controllers/subject.controller");
router.post("/subjects/counts", auth, role(["ADMIN"]), subjectController.setSubjectCount);
router.get("/subjects/counts", auth, role(["ADMIN"]), subjectController.getSubjectCounts);
router.get("/subjects/search", auth, role(["ADMIN"]), subjectController.searchSubjects);

// Excel Export
const exportController = require("../../controllers/export.controller");
router.get("/export/billing-sheet", auth, role(["ADMIN", "BILLING_INCHARGE"]), exportController.exportBillingSheet);

// User Management
router.post("/users", auth, role(["ADMIN"]), adminController.createUser);
router.post("/users/bulk-import", auth, role(["ADMIN"]), upload.single("file"), adminController.bulkImportUsers);
router.get("/users", auth, role(["ADMIN"]), adminController.getUsersByRole);
router.patch("/users/:userId/status", auth, role(["ADMIN"]), adminController.toggleUserStatus);
router.patch("/users/:userId/password", auth, role(["ADMIN"]), adminController.resetUserPassword);

module.exports = router;

