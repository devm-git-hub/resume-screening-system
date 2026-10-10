// controllers/jobController.js
// req.recruiter is set by the attachRecruiter middleware on the write routes.
const Job = require("../models/Job");
const Recruiter = require("../models/Recruiter");
const MatchScore = require("../models/MatchScore");
const Application = require("../models/Application");
const mlClient = require("../config/mlClient");
const { getPagination, buildPagination } = require("../utils/paginate");

// fields a recruiter may change when editing a job
const EDITABLE_FIELDS = [
  "title", "description", "requiredSkills", "minExperienceYears",
  "location", "employmentType", "salaryRange", "status",
];

// Loads the job and checks the logged-in recruiter POSTED it.
// Sends the 404 / 403 response itself and returns null when not allowed.
const findOwnedJob = async (req, res) => {
  const job = await Job.findById(req.params.id);
  if (!job) {
    res.status(404).json({ success: false, message: "Job not found" });
    return null;
  }
  if (String(job.recruiter) !== String(req.recruiter._id)) {
    res.status(403).json({ success: false, message: "You can only change jobs that you posted" });
    return null;
  }
  return job;
};

// @route  POST /api/jobs
const createJob = async (req, res, next) => {
  try {
    const recruiter = req.recruiter;
    const { title, description, requiredSkills, minExperienceYears, location, employmentType, salaryRange } = req.body;
    if (!title || !description) {
      return res.status(400).json({ success: false, message: "title and description are required" });
    }

    let embedding = [];
    try {
      const { data } = await mlClient.post("/embed-text", { text: description });
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

// @route  GET /api/jobs   (public; optionalAuth tells us who is asking)
// Every job gets `isOwner: true` when the logged-in recruiter posted it,
// so the UI can show the delete button only on their own jobs.
const getJobs = async (req, res, next) => {
  try {
    const { search, location, employmentType } = req.query;
    const { page, limit, skip } = getPagination(req.query);

    const query = {};
    if (search) query.$text = { $search: search };
    if (location) query.location = new RegExp(location, "i");
    if (employmentType) query.employmentType = employmentType;

    let myRecruiterId = null;
    if (req.user?.role === "recruiter") {
      const me = await Recruiter.findOne({ user: req.user._id }).select("_id");
      myRecruiterId = me?._id ?? null;
    }

    const [jobs, total] = await Promise.all([
      Job.find(query).populate("recruiter", "companyName").sort("-createdAt").skip(skip).limit(limit),
      Job.countDocuments(query),
    ]);

    const data = jobs.map((job) => ({
      ...job.toObject(),
      isOwner: !!myRecruiterId && String(job.recruiter?._id) === String(myRecruiterId),
    }));

    res.status(200).json({ success: true, data, pagination: buildPagination(total, page, limit) });
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

// @route  PUT /api/jobs/:id    (only the recruiter who posted it)
const updateJob = async (req, res, next) => {
  try {
    const job = await findOwnedJob(req, res);
    if (!job) return;

    EDITABLE_FIELDS.forEach((field) => {
      if (req.body[field] !== undefined) job[field] = req.body[field];
    });
    await job.save();

    res.status(200).json({ success: true, data: job });
  } catch (error) {
    next(error);
  }
};

// @route  DELETE /api/jobs/:id    (only the recruiter who posted it)
// Also removes the match scores and applications for the job, so candidates
// no longer see matches for a job that doesn't exist.
const deleteJob = async (req, res, next) => {
  try {
    const job = await findOwnedJob(req, res);
    if (!job) return;

    await MatchScore.deleteMany({ job: job._id });
    await Application.deleteMany({ job: job._id });
    await Job.findByIdAndDelete(job._id);

    req.recruiter.postedJobs = req.recruiter.postedJobs.filter((id) => String(id) !== String(job._id));
    await req.recruiter.save();

    res.status(200).json({ success: true, message: "Job deleted" });
  } catch (error) {
    next(error);
  }
};

module.exports = { createJob, getJobs, getJobById, updateJob, deleteJob };