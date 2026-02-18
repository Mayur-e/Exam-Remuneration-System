const router = require("express").Router();
const auth = require("../../middleware/authMiddleware");
const role = require("../../middleware/roleMiddleware");
const ctrl = require("../../controllers/accountant.controller");
const { idParamValidation, rejectClaimValidation } = require("../../middleware/validationMiddleware");

router.use(auth, role(["BILLING_INCHARGE"]));

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

// Coordinator Management
const coordinatorCtrl = require("../../controllers/coordinator.controller");
router.get("/coordinators", coordinatorCtrl.getAllCoordinatorAssignments);
router.post("/coordinators/:assignmentId/revoke", coordinatorCtrl.revokeCoordinator);
router.post("/coordinators/reassign", coordinatorCtrl.reassignCoordinator);


module.exports = router;
