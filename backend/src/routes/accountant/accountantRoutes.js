const router = require("express").Router();
const { createAuthMiddleware, authorize } = require("../../middleware/enhancedAuthMiddleware");
const ctrl = require("../../controllers/accountant.controller");
const { idParamValidation, rejectClaimValidation } = require("../../middleware/validationMiddleware");

// Authentication middleware for accountant routes
const authenticate = createAuthMiddleware({
  allowQueryToken: false,
  auditLog: true
});

// All accountant routes are protected - require BILLING_INCHARGE role
router.use(authenticate, authorize(["BILLING_INCHARGE"]));

router.get("/dashboard", ctrl.dashboardStats);

router.get("/claims", ctrl.listSubmittedClaims);
router.get("/claims/:id", idParamValidation, ctrl.getClaimDetails);

router.post("/claims/:id/approve", idParamValidation, ctrl.approveClaim);
router.post("/claims/:id/reject", idParamValidation, rejectClaimValidation, ctrl.rejectClaim);
router.post("/claims/:id/pay", idParamValidation, ctrl.markAsPaid);
router.put("/claims/:id/allowances", idParamValidation, ctrl.updateAllowances);

router.get("/faculty", ctrl.listFaculty);
router.get("/faculty/:id", idParamValidation, ctrl.getFacultyDetails);
router.get("/payments", ctrl.listPayments);

router.put("/profile", ctrl.updateProfile);

// External Supervision
const adminCtrl = require("../../controllers/admin.controller");
router.get("/external/examiners", adminCtrl.getExternalExaminers);
router.get("/external/links", adminCtrl.getExternalLinkStats);
router.get("/external/documents/:id", idParamValidation, adminCtrl.getExternalDocuments);

// Coordinator Management
const coordinatorCtrl = require("../../controllers/coordinator.controller");
router.get("/coordinators", coordinatorCtrl.getAllCoordinatorAssignments);
router.post("/coordinators/:assignmentId/revoke", coordinatorCtrl.revokeCoordinator);
router.post("/coordinators/reassign", coordinatorCtrl.reassignCoordinator);

// Excel Export
const exportController = require("../../controllers/export.controller");
router.get("/export/billing-sheet", exportController.exportBillingSheet);

module.exports = router;
