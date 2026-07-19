// controllers/analyticsController.js
// Aggregation queries powering the Recruiter Analytics Dashboard.

const Job = require("../models/Job");
const Resume = require("../models/Resume");
const Candidate = require("../models/Candidate");
const MatchScore = require("../models/MatchScore");
const Application = require("../models/Application");

// @route  GET /api/analytics/overview
const getOverview = async (req, res, next) => {
  try {
    const [totalJobs, totalCandidates, totalResumes, totalApplications, avgMatchAgg] = await Promise.all([
      Job.countDocuments(),
      Candidate.countDocuments(),
      Resume.countDocuments({ status: "parsed" }),
      Application.countDocuments(),
      MatchScore.aggregate([{ $group: { _id: null, avgScore: { $avg: "$finalMatchPercentage" } } }]),
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalJobs,
        totalCandidates,
        totalResumes,
        totalApplications,
        averageMatchScore: avgMatchAgg[0]?.avgScore?.toFixed(2) || 0,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @route  GET /api/analytics/top-skills
const getTopSkills = async (req, res, next) => {
  try {
    const results = await Candidate.aggregate([
      { $unwind: "$skills" },
      { $group: { _id: "$skills", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 15 },
    ]);
    res.status(200).json({ success: true, data: results });
  } catch (error) {
    next(error);
  }
};

// @route  GET /api/analytics/match-distribution/:jobId
const getMatchDistribution = async (req, res, next) => {
  try {
    const buckets = await MatchScore.aggregate([
      { $match: { job: new (require("mongoose").Types.ObjectId)(req.params.jobId) } },
      {
        $bucket: {
          groupBy: "$finalMatchPercentage",
          boundaries: [0, 20, 40, 60, 80, 100.01],
          default: "other",
          output: { count: { $sum: 1 } },
        },
      },
    ]);
    res.status(200).json({ success: true, data: buckets });
  } catch (error) {
    next(error);
  }
};

module.exports = { getOverview, getTopSkills, getMatchDistribution };
