const express = require("express");
const router = express.Router();
const { createAuthMiddleware, authorize } = require("../../middleware/enhancedAuthMiddleware");
const { sensitiveOperationLimiter } = require("../../middleware/rateLimitingMiddleware");
const adminController = require("../../controllers/admin.controller");
const { idParamValidation, rejectClaimValidation, sendBackClaimValidation } = require("../../middleware/validationMiddleware");
const multer = require("multer");

// Authentication middleware for admin routes
const authenticate = createAuthMiddleware({
  allowQueryToken: false,
  auditLog: true
});

// All admin routes require ADMIN role
router.use(authenticate, authorize(["ADMIN"]));

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
router.get("/dashboard/stats", adminController.getDashboardStats);

// Claims Management
router.get("/claims", adminController.getAllClaims);
router.get("/claims/:id", idParamValidation, adminController.getClaimDetails);
router.post("/claims/:id/reject", idParamValidation, rejectClaimValidation, adminController.rejectClaim);
router.post("/claims/:id/send-back", idParamValidation, sendBackClaimValidation, adminController.sendBackClaim);

// External Supervision
router.get("/external/examiners", adminController.getExternalExaminers);
router.get("/external/links", adminController.getExternalLinkStats);
router.get("/external/documents/:id", idParamValidation, adminController.getExternalDocuments);

// Faculty Oversight
router.get("/faculty", adminController.listAllFaculty);
router.get("/faculty/:id", idParamValidation, adminController.getFacultyProfile);

// Billing Incharge Audit
router.get("/billing-incharge/audit", adminController.getBillingInchargeAudit);
router.get("/billing-incharge/:id/actions", idParamValidation, adminController.getBillingInchargeActions);

// Audit Logs
router.get("/audit-logs", adminController.getAuditLogs);

// Rate Management
router.get("/rates/academic-years", adminController.getAcademicYears);
router.get("/rates", adminController.getRates);
router.put("/rates", sensitiveOperationLimiter, adminController.updateRates);
router.post("/rates/clone", sensitiveOperationLimiter, adminController.cloneRatesToNewYear);

// Subject Count Management
const subjectController = require("../../controllers/subject.controller");
router.post("/subjects/counts", sensitiveOperationLimiter, subjectController.setSubjectCount);
router.get("/subjects/counts", subjectController.getSubjectCounts);
router.get("/subjects/search", subjectController.searchSubjects);

// Excel Export
const exportController = require("../../controllers/export.controller");
router.get("/export/billing-sheet", exportController.exportBillingSheet);

// User Management
router.post("/users", sensitiveOperationLimiter, adminController.createUser);
router.post("/users/bulk-import", sensitiveOperationLimiter, upload.single("file"), adminController.bulkImportUsers);
router.get("/users", adminController.getUsersByRole);
router.patch("/users/:userId/status", sensitiveOperationLimiter, adminController.toggleUserStatus);
router.patch("/users/:userId/password", sensitiveOperationLimiter, adminController.resetUserPassword);

module.exports = router;

