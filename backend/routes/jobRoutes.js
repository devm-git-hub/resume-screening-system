// routes/jobRoutes.js
const express = require("express");
const router = express.Router();
const { createJob, getJobs, getJobById, updateJob, deleteJob } = require("../controllers/jobController");
const { protect, authorize } = require("../middleware/auth");

router.post("/", protect, authorize("recruiter"), createJob);
router.get("/", getJobs);
router.get("/:id", getJobById);
router.put("/:id", protect, authorize("recruiter"), updateJob);
router.delete("/:id", protect, authorize("recruiter", "admin"), deleteJob);

module.exports = router;
