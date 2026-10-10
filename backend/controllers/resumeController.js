// controllers/resumeController.js
// req.candidate is set by the attachCandidate middleware (see routes).
const fs = require("fs");
const path = require("path");
const FormData = require("form-data");

const mlClient = require("../config/mlClient");
const Resume = require("../models/Resume");
const Job = require("../models/Job");
const MatchScore = require("../models/MatchScore");
const { matchResumesToJob } = require("../services/matching");

// @route  POST /api/resumes/upload
// Parses the resume, then automatically matches it against every OPEN job and
// returns those matches so the candidate sees them immediately.
const uploadResume = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "Resume file is required" });
    }

    const candidate = req.candidate;
    const fileType = path.extname(req.file.originalname).toLowerCase() === ".pdf" ? "pdf" : "docx";

    const resume = await Resume.create({
      candidate: candidate._id,
      originalFileName: req.file.originalname,
      storagePath: req.file.path,
      fileType,
      fileSizeKB: Math.round(req.file.size / 1024),
      status: "processing",
    });

    // ---- 1. Parse the resume with the ML service ----
    try {
      const form = new FormData();
      form.append("file", fs.createReadStream(req.file.path), req.file.originalname);

      const { data: parsed } = await mlClient.post("/parse-resume", form, {
        headers: form.getHeaders(),
        timeout: 30000,
      });

      resume.rawText = parsed.raw_text;
      resume.parsedData = {
        name: parsed.name,
        email: parsed.email,
        phone: parsed.phone,
        skills: parsed.skills,
        education: parsed.education,
        experience: parsed.experience,
        totalExperienceYears: parsed.total_experience_years,
        summary: parsed.summary,
      };
      resume.status = "parsed";
      await resume.save();

      candidate.skills = Array.from(new Set([...(candidate.skills || []), ...(parsed.skills || [])]));
      candidate.education = parsed.education || candidate.education;
      candidate.experience = parsed.experience || candidate.experience;
      candidate.totalExperienceYears = parsed.total_experience_years ?? candidate.totalExperienceYears;
      candidate.resumes.push(resume._id);
      candidate.activeResume = resume._id;
      await candidate.save();
    } catch (mlError) {
      resume.status = "failed";
      resume.parsingError = mlError.response?.data?.detail || mlError.message;
      await resume.save();
      console.error("ML parsing failed:", resume.parsingError);
    }

    // ---- 2. Auto-match the parsed resume against every open job ----
    let matches = [];
    if (resume.status === "parsed") {
      try {
        const openJobs = await Job.find({ status: "open" });
        await Promise.all(openJobs.map((job) => matchResumesToJob(job, [resume])));

        matches = await MatchScore.find({ resume: resume._id })
          .sort({ finalMatchPercentage: -1 })
          .populate({ path: "job", select: "title location employmentType requiredSkills minExperienceYears" });
      } catch (matchError) {
        // matching must never make the upload itself fail
        console.error("Auto-matching failed:", matchError.response?.data?.detail || matchError.message);
      }
    }

    res.status(201).json({ success: true, message: "Resume uploaded", data: resume, matches });
  } catch (error) {
    next(error);
  }
};

// @route  GET /api/resumes/:id
const getResumeById = async (req, res, next) => {
  try {
    const resume = await Resume.findById(req.params.id).populate("candidate");
    if (!resume) return res.status(404).json({ success: false, message: "Resume not found" });
    res.status(200).json({ success: true, data: resume });
  } catch (error) {
    next(error);
  }
};

// @route  GET /api/resumes/mine
const getMyResumes = async (req, res, next) => {
  try {
    const resumes = await Resume.find({ candidate: req.candidate._id }).sort("-createdAt");
    res.status(200).json({ success: true, data: resumes });
  } catch (error) {
    next(error);
  }
};

// @route  DELETE /api/resumes/:id
const deleteResume = async (req, res, next) => {
  try {
    const resume = await Resume.findById(req.params.id);
    if (!resume) return res.status(404).json({ success: false, message: "Resume not found" });

    const candidate = req.candidate;
    if (String(resume.candidate) !== String(candidate._id)) {
      return res.status(403).json({ success: false, message: "Not authorized to delete this resume" });
    }

    if (fs.existsSync(resume.storagePath)) fs.unlinkSync(resume.storagePath);

    await Resume.findByIdAndDelete(req.params.id);
    await MatchScore.deleteMany({ resume: req.params.id });

    candidate.resumes = candidate.resumes.filter((r) => String(r) !== req.params.id);
    if (String(candidate.activeResume) === req.params.id) candidate.activeResume = undefined;
    await candidate.save();

    res.status(200).json({ success: true, message: "Resume deleted" });
  } catch (error) {
    next(error);
  }
};

module.exports = { uploadResume, getResumeById, getMyResumes, deleteResume };