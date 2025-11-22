const express = require("express");
const router = express.Router();
const { sendSOS } = require("../controllers/sosController");
const protect = require("../middleware/authMiddleware");

router.post("/send", protect, sendSOS);

module.exports = router;
