// services/matching.js
// ONE place that scores resumes against a job, saves the MatchScore docs and
// re-ranks the job. Used by BOTH the candidate upload (auto-match) and the
// recruiter's "Run AI Matching" button.
const mlClient = require("../config/mlClient");
const MatchScore = require("../models/MatchScore");

// Weights for the final composite score (the ONLY place they are defined)
const WEIGHTS = { semantic: 0.5, skills: 0.3, experience: 0.15, education: 0.05 };

const toFinalPercentage = (r) =>
  Math.round(
    (WEIGHTS.semantic * r.semantic_similarity +
      WEIGHTS.skills * r.skill_match_score +
      WEIGHTS.experience * r.experience_match_score +
      WEIGHTS.education * r.education_match_score) *
      10000
  ) / 100;

// Recompute rank 1..N for every score of a job (best first).
const rerankJob = async (jobId) => {
  const all = await MatchScore.find({ job: jobId }).sort({ finalMatchPercentage: -1 }).select("_id");
  if (all.length === 0) return;
  await MatchScore.bulkWrite(
    all.map((m, i) => ({ updateOne: { filter: { _id: m._id }, update: { rank: i + 1 } } }))
  );
};

// Scores `resumes` (Resume documents) against `job`, saves/updates the
// MatchScore docs, then re-ranks the job.
const matchResumesToJob = async (job, resumes) => {
  if (resumes.length === 0) return;

  const { data } = await mlClient.post("/match-candidates", {
    job_description: job.description,
    required_skills: job.requiredSkills,
    min_experience_years: job.minExperienceYears || 0,
    candidates: resumes.map((r) => ({
      resume_id: r._id.toString(),
      resume_text: r.rawText,
      skills: r.parsedData?.skills || [],
      total_experience_years: r.parsedData?.totalExperienceYears || 0,
      education: r.parsedData?.education || [],
    })),
  });

  const resumeMap = new Map(resumes.map((r) => [r._id.toString(), r]));

  await Promise.all(
    data.results.map((s) => {
      const resume = resumeMap.get(s.resume_id);
      if (!resume) return null;
      return MatchScore.findOneAndUpdate(
        { resume: resume._id, job: job._id },
        {
          resume: resume._id,
          job: job._id,
          candidate: resume.candidate._id ?? resume.candidate,
          semanticSimilarity: s.semantic_similarity,
          skillMatchScore: s.skill_match_score,
          experienceMatchScore: s.experience_match_score,
          educationMatchScore: s.education_match_score,
          finalMatchPercentage: toFinalPercentage(s),
          matchedSkills: s.matched_skills,
          missingSkills: s.missing_skills,
          insights: s.insight,
        },
        { upsert: true, new: true }
      );
    })
  );

  await rerankJob(job._id);
};

module.exports = { matchResumesToJob, rerankJob };