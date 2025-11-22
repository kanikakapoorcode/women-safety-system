const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");

const {
  createAlert,
  getMyAlerts,
  getGuardianAlerts,
  getAllAlerts,
  resolveAlert,
  updateLocation,
} = require("../controllers/alertController");

router.post("/create", auth, createAlert);
router.get("/my-alerts", auth, getMyAlerts);
router.get("/guardian-alerts", auth, getGuardianAlerts);
router.get("/all-alerts", auth, getAllAlerts);
router.put("/resolve/:alertId", auth, resolveAlert);
router.put("/update-location", auth, updateLocation);

module.exports = router;

