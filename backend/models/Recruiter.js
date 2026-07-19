// models/Recruiter.js
const mongoose = require("mongoose");

const recruiterSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    companyName: { type: String, required: true, trim: true },
    designation: { type: String, trim: true },
    companyWebsite: { type: String, trim: true },
    industry: { type: String, trim: true },
    postedJobs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Job" }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Recruiter", recruiterSchema);
