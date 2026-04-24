const router = require("express").Router();
const externalCtrl = require("../../controllers/external.controller");
const upload = require("../../middleware/upload");
const authMiddleware = require("../../middleware/authMiddleware");

router.get("/claim/:token", externalCtrl.getExternalClaim);

router.post(
  "/claim/:token",
  upload.fields([
    { name: "pan_document", maxCount: 1 },
    { name: "cancelled_cheque", maxCount: 1 }
  ]),
  externalCtrl.submitExternalClaim
);

// Get claim info (including rejections for resubmission)
router.get("/claim/:token/info", externalCtrl.getExternalClaimInfo);

// Google Form webhook — called by Apps Script, secured by WEBHOOK_SECRET
router.post("/google-form-webhook", externalCtrl.googleFormWebhook);

// Send examiner invitation email — faculty only, JWT protected
router.post("/send-examiner-invite", authMiddleware, externalCtrl.sendExaminerInvite);

module.exports = router;
