// routes/jobRoutes.js
const express = require("express");
const router = express.Router();
const { createJob, getJobs, getJobById, updateJob, deleteJob } = require("../controllers/jobController");
const { protect, authorize } = require("../middleware/auth");
const optionalAuth = require("../middleware/optionalAuth");
const { attachRecruiter } = require("../middleware/profile");

router.post("/", protect, authorize("recruiter"), attachRecruiter, createJob);
router.get("/", optionalAuth, getJobs);
router.get("/:id", getJobById);
// edit / delete: recruiters only, and the controller checks they own the job
router.put("/:id", protect, authorize("recruiter"), attachRecruiter, updateJob);
router.delete("/:id", protect, authorize("recruiter"), attachRecruiter, deleteJob);

module.exports = router;