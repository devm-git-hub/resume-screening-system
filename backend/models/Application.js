// models/Application.js
// Links a Candidate's Resume to a Job they applied to (or were matched against).

const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema(
  {
    job: { type: mongoose.Schema.Types.ObjectId, ref: "Job", required: true },
    candidate: { type: mongoose.Schema.Types.ObjectId, ref: "Candidate", required: true },
    resume: { type: mongoose.Schema.Types.ObjectId, ref: "Resume", required: true },
    matchScore: { type: mongoose.Schema.Types.ObjectId, ref: "MatchScore" },
    status: {
      type: String,
      enum: ["applied", "shortlisted", "rejected", "hired", "withdrawn"],
      default: "applied",
    },
    recruiterNotes: { type: String },
  },
  { timestamps: true }
);

applicationSchema.index({ job: 1, candidate: 1 }, { unique: true });

module.exports = mongoose.model("Application", applicationSchema);
