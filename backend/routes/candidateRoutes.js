// routes/candidateRoutes.js
const express = require("express");
const router = express.Router();
const { getCandidateById, searchCandidates, updateMyProfile } = require("../controllers/candidateController");
const { protect, authorize } = require("../middleware/auth");

router.get("/", protect, authorize("recruiter", "admin"), searchCandidates);
router.put("/me", protect, authorize("candidate"), updateMyProfile);
router.get("/:id", protect, getCandidateById);

module.exports = router;
