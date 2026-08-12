// controllers/matchController.js
// Orchestrates the matching pipeline:
// For a given Job, fetch candidate resumes, call the ML microservice
// for semantic similarity + skill overlap, combine into a weighted
// final score, persist MatchScore docs, and return candidates ranked
// best-to-worst.

const axios = require("axios");
const Job = require("../models/Job");
const Resume = require("../models/Resume");
const MatchScore = require("../models/MatchScore");
const Application = require("../models/Application");

const ML_SERVICE_URL =
  process.env.ML_SERVICE_URL || "http://localhost:8000";

// Weights for the final composite score
const WEIGHTS = {
  semantic: 0.5,
  skills: 0.3,
  experience: 0.15,
  education: 0.05,
};

// @route  POST /api/matches/run/:jobId
// @desc   Compute/refresh match scores for ALL parsed resumes against a job
// @access Private (recruiter - job owner)
const runMatchingForJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.jobId).select("+embedding");

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    const resumes = await Resume.find({
      status: "parsed",
    }).populate("candidate");

    if (resumes.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No parsed resumes to match",
        data: [],
      });
    }

    // Send job description + all resume information to ML service
    const payload = {
      job_description: job.description,
      required_skills: job.requiredSkills,
      min_experience_years: job.minExperienceYears || 0,

      candidates: resumes.map((r) => ({
        resume_id: r._id.toString(),
        resume_text: r.rawText,
        skills: r.parsedData?.skills || [],
        total_experience_years:
          r.parsedData?.totalExperienceYears || 0,
        education: r.parsedData?.education || [],
      })),
    };

    const { data } = await axios.post(
      `${ML_SERVICE_URL}/match-candidates`,
      payload,
      {
        timeout: 60000,
      }
    );

    // Expected response:
    // {
    //   results: [
    //     {
    //       resume_id,
    //       semantic_similarity,
    //       skill_match_score,
    //       experience_match_score,
    //       education_match_score,
    //       matched_skills,
    //       missing_skills,
    //       insight
    //     }
    //   ]
    // }

    const scored = data.results.map((r) => {
      const finalPct =
        (WEIGHTS.semantic * r.semantic_similarity +
          WEIGHTS.skills * r.skill_match_score +
          WEIGHTS.experience * r.experience_match_score +
          WEIGHTS.education * r.education_match_score) *
        100;

      return {
        ...r,
        finalMatchPercentage:
          Math.round(finalPct * 100) / 100,
      };
    });

    // Rank descending by final match percentage
    scored.sort(
      (a, b) =>
        b.finalMatchPercentage - a.finalMatchPercentage
    );

    const resumeMap = new Map(
      resumes.map((r) => [r._id.toString(), r])
    );

    const bulkResults = [];

    for (let i = 0; i < scored.length; i++) {
      const s = scored[i];

      const resume = resumeMap.get(s.resume_id);

      if (!resume) continue;

      // Make sure candidate exists
      if (!resume.candidate) continue;

      const matchDoc = await MatchScore.findOneAndUpdate(
        {
          resume: resume._id,
          job: job._id,
        },
        {
          resume: resume._id,
          job: job._id,
          candidate: resume.candidate._id,

          semanticSimilarity: s.semantic_similarity,
          skillMatchScore: s.skill_match_score,
          experienceMatchScore: s.experience_match_score,
          educationMatchScore: s.education_match_score,

          finalMatchPercentage: s.finalMatchPercentage,

          matchedSkills: s.matched_skills || [],
          missingSkills: s.missing_skills || [],
          insights: s.insight || "",

          rank: i + 1,
        },
        {
          upsert: true,
          new: true,
        }
      );

      bulkResults.push(matchDoc);
    }

    return res.status(200).json({
      success: true,
      message: "Matching complete",
      data: bulkResults,
    });
  } catch (error) {
    next(error);
  }
};

// @route  GET /api/matches/job/:jobId
// @desc   Get ranked candidates for a job (paginated)
// @access Private (recruiter)
const getMatchesForJob = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      minScore = 0,
    } = req.query;

    const query = {
      job: req.params.jobId,
      finalMatchPercentage: {
        $gte: Number(minScore),
      },
    };

    const matches = await MatchScore.find(query)
      .sort({
        finalMatchPercentage: -1,
      })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .populate({
        path: "resume",
        select: "originalFileName parsedData",
      })
      .populate({
        path: "candidate",
        populate: {
          path: "user",
          select: "name email",
        },
      });

    const total = await MatchScore.countDocuments(query);

    return res.status(200).json({
      success: true,
      data: matches,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @route  GET /api/matches/candidate/:candidateId
// @desc   Get all job matches for a specific candidate
// @access Private (candidate)
const getMatchesForCandidate = async (req, res, next) => {
  try {
    const matches = await MatchScore.find({
      candidate: req.params.candidateId,
    })
      .sort({
        finalMatchPercentage: -1,
      })
      .populate({
        path: "job",
        select: "title location employmentType recruiter",
      });

    return res.status(200).json({
      success: true,
      data: matches,
    });
  } catch (error) {
    next(error);
  }
};

// @route  GET /api/matches/mine
// @desc   Get all job matches for the LOGGED-IN candidate
// @access Private (candidate)
const getMyMatches = async (req, res, next) => {
  try {
    const Candidate = require("../models/Candidate");

    const candidate = await Candidate.findOne({
      user: req.user._id,
    });

    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: "Candidate profile not found",
      });
    }

    const matches = await MatchScore.find({
      candidate: candidate._id,
    })
      .sort({
        finalMatchPercentage: -1,
      })
      .populate({
        path: "job",
        select: "title location employmentType recruiter",
      });

    return res.status(200).json({
      success: true,
      data: matches,
    });
  } catch (error) {
    next(error);
  }
};

// Export controllers
module.exports = {
  runMatchingForJob,
  getMatchesForJob,
  getMatchesForCandidate,
  getMyMatches,
};