// models/Candidate.js
const mongoose = require("mongoose");

const candidateSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    phone: { type: String, trim: true },
    location: { type: String, trim: true },
    headline: { type: String, trim: true }, // e.g. "Full Stack Developer"
    totalExperienceYears: { type: Number, default: 0 },
    skills: [{ type: String, trim: true, lowercase: true }],
    education: [
      {
        degree: String,
        institution: String,
        year: String,
      },
    ],
    experience: [
      {
        title: String,
        company: String,
        duration: String,
        description: String,
      },
    ],
    resumes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Resume" }],
    activeResume: { type: mongoose.Schema.Types.ObjectId, ref: "Resume" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Candidate", candidateSchema);
