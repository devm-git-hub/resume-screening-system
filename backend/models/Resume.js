// models/Resume.js
// Stores the uploaded resume file metadata + the structured data
// extracted by the ML microservice (NER, skills, education, experience).

const mongoose = require("mongoose");

const resumeSchema = new mongoose.Schema(
  {
    candidate: { type: mongoose.Schema.Types.ObjectId, ref: "Candidate", required: true },
    originalFileName: { type: String, required: true },
    storagePath: { type: String, required: true }, // path/URL to stored file
    fileType: { type: String, enum: ["pdf", "docx"], required: true },
    fileSizeKB: { type: Number },

    rawText: { type: String }, // full extracted text (for re-processing/search)

    parsedData: {
      name: String,
      email: String,
      phone: String,
      skills: [{ type: String, lowercase: true, trim: true }],
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
      totalExperienceYears: Number,
      summary: String, // AI-generated resume summary
    },

    status: {
      type: String,
      enum: ["uploaded", "processing", "parsed", "failed"],
      default: "uploaded",
    },
    parsingError: { type: String },
  },
  { timestamps: true }
);

resumeSchema.index({ candidate: 1, createdAt: -1 });

module.exports = mongoose.model("Resume", resumeSchema);
