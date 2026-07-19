// models/MatchScore.js
// Stores the semantic-similarity result between one Resume and one Job,
// as computed by the ML microservice (SBERT cosine similarity + weighted
// skill/experience/education sub-scores).

const mongoose = require("mongoose");

const matchScoreSchema = new mongoose.Schema(
  {
    resume: { type: mongoose.Schema.Types.ObjectId, ref: "Resume", required: true },
    job: { type: mongoose.Schema.Types.ObjectId, ref: "Job", required: true },
    candidate: { type: mongoose.Schema.Types.ObjectId, ref: "Candidate", required: true },

    semanticSimilarity: { type: Number, required: true }, // raw cosine similarity 0-1
    skillMatchScore: { type: Number, default: 0 }, // 0-1
    experienceMatchScore: { type: Number, default: 0 }, // 0-1
    educationMatchScore: { type: Number, default: 0 }, // 0-1

    finalMatchPercentage: { type: Number, required: true, min: 0, max: 100 },

    matchedSkills: [String],
    missingSkills: [String],

    insights: { type: String }, // AI-generated candidate insight/explanation

    rank: { type: Number }, // rank of this resume for this job (1 = best)
  },
  { timestamps: true }
);

matchScoreSchema.index({ job: 1, finalMatchPercentage: -1 });
matchScoreSchema.index({ resume: 1, job: 1 }, { unique: true });

module.exports = mongoose.model("MatchScore", matchScoreSchema);
