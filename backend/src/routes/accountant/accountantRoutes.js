const router = require("express").Router();
const auth = require("../../middleware/authMiddleware");
const role = require("../../middleware/roleMiddleware");
const ctrl = require("../../controllers/accountant.controller");

router.use(auth, role(["ACCOUNTANT"]));

router.get("/dashboard", ctrl.dashboardStats);

router.get("/claims", ctrl.listSubmittedClaims);
router.get("/claims/:id", ctrl.getClaimDetails);

router.post("/claims/:id/approve", ctrl.approveClaim);
router.post("/claims/:id/reject", ctrl.rejectClaim);
router.post("/claims/:id/pay", ctrl.markAsPaid);

router.get("/faculty", ctrl.listFaculty);
router.get("/faculty/:id", ctrl.getFacultyDetails);
router.get("/payments", ctrl.listPayments);


module.exports = router;
