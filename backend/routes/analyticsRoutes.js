// routes/analyticsRoutes.js
const express = require("express");
const router = express.Router();
const { getOverview, getTopSkills, getMatchDistribution } = require("../controllers/analyticsController");
const { protect, authorize } = require("../middleware/auth");

router.get("/overview", protect, authorize("recruiter", "admin"), getOverview);
router.get("/top-skills", protect, authorize("recruiter", "admin"), getTopSkills);
router.get("/match-distribution/:jobId", protect, authorize("recruiter", "admin"), getMatchDistribution);

module.exports = router;
