const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");

const {
  getProfile,
  getMyGuardians,
  searchUsers,
  addGuardian,
  removeGuardian,
} = require("../controllers/userController");

router.get("/profile", auth, getProfile);
router.get("/guardians", auth, getMyGuardians);
router.get("/search", auth, searchUsers);
router.post("/guardians", auth, addGuardian);
router.delete("/guardians/:guardianId", auth, removeGuardian);

module.exports = router;

