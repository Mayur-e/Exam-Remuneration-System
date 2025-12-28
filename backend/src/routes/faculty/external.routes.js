const router = require("express").Router();
const externalCtrl = require("../../controllers/external.controller");
const upload = require("../../middleware/upload");

router.get("/claim/:token", externalCtrl.getExternalClaim);

router.post(
  "/claim/:token",
  upload.fields([
    { name: "pan_document", maxCount: 1 },
    { name: "cancelled_cheque", maxCount: 1 }
  ]),
  externalCtrl.submitExternalClaim
);

module.exports = router;
