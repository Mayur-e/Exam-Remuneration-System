const express = require("express");
const router = express.Router();
const auth = require("../../middleware/authMiddleware");
const role = require("../../middleware/roleMiddleware");

router.get("/dashboard", auth, role(["ACCOUNTANT"]), (req, res) => {
  res.json({ message: "Accountant dashboard access granted" });
});

module.exports = router;
