// routes/matchRoutes.js
const express = require("express");
const router = express.Router();
const {
  runMatchingForJob,
  getMatchesForJob,
  getMatchesForCandidate,
  getMyMatches,
} = require("../controllers/matchController");
const { protect, authorize } = require("../middleware/auth");

router.post("/run/:jobId", protect, authorize("recruiter"), runMatchingForJob);
router.get("/job/:jobId", protect, authorize("recruiter"), getMatchesForJob);
router.get("/mine", protect, authorize("candidate"), getMyMatches);
router.get("/candidate/:candidateId", protect, getMatchesForCandidate);

module.exports = router;