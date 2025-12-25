const router = require("express").Router();
const auth = require("../../middleware/authMiddleware");
const role = require("../../middleware/roleMiddleware");
const ctrl = require("../../controllers/faculty.bank.controller");

router.use(auth, role("FACULTY"));

router.get("/", ctrl.getBank);
router.post("/", ctrl.saveBank);
router.put("/", ctrl.saveBank);

module.exports = router;
