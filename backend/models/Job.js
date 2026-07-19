// models/Job.js
const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
  {
    recruiter: { type: mongoose.Schema.Types.ObjectId, ref: "Recruiter", required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true }, // raw JD text
    requiredSkills: [{ type: String, lowercase: true, trim: true }],
    minExperienceYears: { type: Number, default: 0 },
    location: { type: String, trim: true },
    employmentType: {
      type: String,
      enum: ["full-time", "part-time", "internship", "contract"],
      default: "full-time",
    },
    salaryRange: { min: Number, max: Number },
    embedding: { type: [Number], select: false }, // SBERT vector for the JD, hidden by default
    status: { type: String, enum: ["open", "closed", "draft"], default: "open" },
    applications: [{ type: mongoose.Schema.Types.ObjectId, ref: "Application" }],
  },
  { timestamps: true }
);

jobSchema.index({ title: "text", description: "text" });

module.exports = mongoose.model("Job", jobSchema);
