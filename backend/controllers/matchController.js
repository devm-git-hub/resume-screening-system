// controllers/matchController.js
const Job = require("../models/Job");
const Resume = require("../models/Resume");
const MatchScore = require("../models/MatchScore");
const { getPagination, buildPagination } = require("../utils/paginate");
const { matchResumesToJob } = require("../services/matching");

// Populate used wherever a recruiter sees ranked candidates
const withCandidateDetails = (query) =>
  query
    .populate({ path: "resume", select: "originalFileName parsedData" })
    .populate({ path: "candidate", populate: { path: "user", select: "name email" } });

// Only returns matches whose resume STILL EXISTS (hides leftovers from
// resumes deleted earlier, and returns nothing if the candidate has no resume).
const findMatchesForCandidate = async (candidateId) => {
  const resumeIds = await Resume.find({ candidate: candidateId }).distinct("_id");
  return MatchScore.find({ candidate: candidateId, resume: { $in: resumeIds } })
    .sort({ finalMatchPercentage: -1 })
    .populate({ path: "job", select: "title location employmentType recruiter" });
};

// @route  POST /api/matches/run/:jobId
const runMatchingForJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.jobId);
    if (!job) return res.status(404).json({ success: false, message: "Job not found" });

    const resumes = await Resume.find({ status: "parsed" });
    if (resumes.length === 0) {
      return res.status(200).json({ success: true, message: "No parsed resumes to match", data: [] });
    }

    await matchResumesToJob(job, resumes);

    const matches = await withCandidateDetails(MatchScore.find({ job: job._id }).sort({ finalMatchPercentage: -1 }));
    res.status(200).json({ success: true, message: "Matching complete", data: matches });
  } catch (error) {
    next(error);
  }
};

// @route  GET /api/matches/job/:jobId
const getMatchesForJob = async (req, res, next) => {
  try {
    const { minScore = 0 } = req.query;
    const { page, limit, skip } = getPagination(req.query);
    const query = { job: req.params.jobId, finalMatchPercentage: { $gte: Number(minScore) } };

    const [matches, total] = await Promise.all([
      withCandidateDetails(MatchScore.find(query).sort({ finalMatchPercentage: -1 }).skip(skip).limit(limit)),
      MatchScore.countDocuments(query),
    ]);

    res.status(200).json({ success: true, data: matches, pagination: buildPagination(total, page, limit) });
  } catch (error) {
    next(error);
  }
};

// @route  GET /api/matches/candidate/:candidateId
const getMatchesForCandidate = async (req, res, next) => {
  try {
    res.status(200).json({ success: true, data: await findMatchesForCandidate(req.params.candidateId) });
  } catch (error) {
    next(error);
  }
};

// @route  GET /api/matches/mine   (logged-in candidate, via attachCandidate)
const getMyMatches = async (req, res, next) => {
  try {
    res.status(200).json({ success: true, data: await findMatchesForCandidate(req.candidate._id) });
  } catch (error) {
    next(error);
  }
};

module.exports = { runMatchingForJob, getMatchesForJob, getMatchesForCandidate, getMyMatches };