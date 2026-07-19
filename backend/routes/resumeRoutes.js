// routes/resumeRoutes.js
const express = require("express");
const router = express.Router();
const { uploadResume, getResumeById, getMyResumes, deleteResume } = require("../controllers/resumeController");
const { protect, authorize } = require("../middleware/auth");
const upload = require("../middleware/upload");

router.post("/upload", protect, authorize("candidate"), upload.single("resume"), uploadResume);
router.get("/mine", protect, authorize("candidate"), getMyResumes);
router.get("/:id", protect, getResumeById);
router.delete("/:id", protect, authorize("candidate"), deleteResume);

module.exports = router;
