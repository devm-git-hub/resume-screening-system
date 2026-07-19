// controllers/resumeController.js
// Handles resume upload, delegates text-extraction/NLP-parsing to the
// Python ML microservice, then persists structured results in MongoDB.

const fs = require("fs");
const path = require("path");
const FormData = require("form-data");
const axios = require("axios");

const Resume = require("../models/Resume");
const Candidate = require("../models/Candidate");

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || "http://localhost:8000";

// @route  POST /api/resumes/upload
// @access Private (candidate)
const uploadResume = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "Resume file is required" });
    }

    const candidate = await Candidate.findOne({ user: req.user._id });
    if (!candidate) {
      return res.status(404).json({ success: false, message: "Candidate profile not found" });
    }

    const fileType = path.extname(req.file.originalname).toLowerCase() === ".pdf" ? "pdf" : "docx";

    const resume = await Resume.create({
      candidate: candidate._id,
      originalFileName: req.file.originalname,
      storagePath: req.file.path,
      fileType,
      fileSizeKB: Math.round(req.file.size / 1024),
      status: "processing",
    });

    // Call the ML microservice to parse the resume (async, but we await here for simplicity;
    // in production this would be pushed to a queue like BullMQ for scalability)
    try {
      const form = new FormData();
      form.append("file", fs.createReadStream(req.file.path), req.file.originalname);

      const mlResponse = await axios.post(`${ML_SERVICE_URL}/parse-resume`, form, {
        headers: form.getHeaders(),
        timeout: 30000,
      });

      const parsed = mlResponse.data; // { name, email, phone, skills, education, experience, summary, ... }

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

      // Sync extracted skills/education/experience onto the Candidate profile
      candidate.skills = Array.from(new Set([...(candidate.skills || []), ...(parsed.skills || [])]));
      candidate.education = parsed.education || candidate.education;
      candidate.experience = parsed.experience || candidate.experience;
      candidate.totalExperienceYears = parsed.total_experience_years ?? candidate.totalExperienceYears;
      candidate.resumes.push(resume._id);
      candidate.activeResume = resume._id;
      await candidate.save();
    } catch (mlError) {
      resume.status = "failed";
      resume.parsingError = mlError.message;
      await resume.save();
      console.error("ML parsing failed:", mlError.message);
    }

    res.status(201).json({ success: true, message: "Resume uploaded", data: resume });
  } catch (error) {
    next(error);
  }
};

// @route  GET /api/resumes/:id
// @access Private
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
// @access Private (candidate)
const getMyResumes = async (req, res, next) => {
  try {
    const candidate = await Candidate.findOne({ user: req.user._id });
    const resumes = await Resume.find({ candidate: candidate._id }).sort("-createdAt");
    res.status(200).json({ success: true, data: resumes });
  } catch (error) {
    next(error);
  }
};

// @route  DELETE /api/resumes/:id
// @access Private (candidate - owner only)
const deleteResume = async (req, res, next) => {
  try {
    const resume = await Resume.findById(req.params.id);
    if (!resume) return res.status(404).json({ success: false, message: "Resume not found" });

    const candidate = await Candidate.findOne({ user: req.user._id });
    if (!candidate || String(resume.candidate) !== String(candidate._id)) {
      return res.status(403).json({ success: false, message: "Not authorized to delete this resume" });
    }

    if (fs.existsSync(resume.storagePath)) fs.unlinkSync(resume.storagePath);

    await Resume.findByIdAndDelete(req.params.id);
    candidate.resumes = candidate.resumes.filter((r) => String(r) !== req.params.id);
    if (String(candidate.activeResume) === req.params.id) candidate.activeResume = undefined;
    await candidate.save();

    res.status(200).json({ success: true, message: "Resume deleted" });
  } catch (error) {
    next(error);
  }
};

module.exports = { uploadResume, getResumeById, getMyResumes, deleteResume };
