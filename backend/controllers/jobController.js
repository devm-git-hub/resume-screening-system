// controllers/jobController.js
const Job = require("../models/Job");
const Recruiter = require("../models/Recruiter");
const axios = require("axios");

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || "http://localhost:8000";

// @route  POST /api/jobs
// @access Private (recruiter)
const createJob = async (req, res, next) => {
  try {
    const recruiter = await Recruiter.findOne({ user: req.user._id });
    if (!recruiter) return res.status(404).json({ success: false, message: "Recruiter profile not found" });

    const { title, description, requiredSkills, minExperienceYears, location, employmentType, salaryRange } = req.body;
    if (!title || !description) {
      return res.status(400).json({ success: false, message: "title and description are required" });
    }

    // Ask ML service to compute & cache an embedding for this JD upfront (optional optimization)
    let embedding = [];
    try {
      const { data } = await axios.post(`${ML_SERVICE_URL}/embed-text`, { text: description });
      embedding = data.embedding;
    } catch (e) {
      console.warn("Could not pre-compute JD embedding:", e.message);
    }

    const job = await Job.create({
      recruiter: recruiter._id,
      title,
      description,
      requiredSkills,
      minExperienceYears,
      location,
      employmentType,
      salaryRange,
      embedding,
    });

    recruiter.postedJobs.push(job._id);
    await recruiter.save();

    res.status(201).json({ success: true, message: "Job created", data: job });
  } catch (error) {
    next(error);
  }
};

// @route  GET /api/jobs
// @access Public / Private
const getJobs = async (req, res, next) => {
  try {
    const { search, page = 1, limit = 10, location, employmentType } = req.query;
    const query = {};
    if (search) query.$text = { $search: search };
    if (location) query.location = new RegExp(location, "i");
    if (employmentType) query.employmentType = employmentType;

    const jobs = await Job.find(query)
      .populate("recruiter", "companyName")
      .sort("-createdAt")
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Job.countDocuments(query);

    res.status(200).json({
      success: true,
      data: jobs,
      pagination: { total, page: Number(page), pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};

// @route  GET /api/jobs/:id
const getJobById = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id).populate("recruiter", "companyName designation");
    if (!job) return res.status(404).json({ success: false, message: "Job not found" });
    res.status(200).json({ success: true, data: job });
  } catch (error) {
    next(error);
  }
};

// @route  PUT /api/jobs/:id
const updateJob = async (req, res, next) => {
  try {
    const job = await Job.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!job) return res.status(404).json({ success: false, message: "Job not found" });
    res.status(200).json({ success: true, data: job });
  } catch (error) {
    next(error);
  }
};

// @route  DELETE /api/jobs/:id
const deleteJob = async (req, res, next) => {
  try {
    const job = await Job.findByIdAndDelete(req.params.id);
    if (!job) return res.status(404).json({ success: false, message: "Job not found" });
    res.status(200).json({ success: true, message: "Job deleted" });
  } catch (error) {
    next(error);
  }
};

module.exports = { createJob, getJobs, getJobById, updateJob, deleteJob };
