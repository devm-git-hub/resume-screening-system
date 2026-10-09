// models/subschemas.js
const mongoose = require("mongoose");

const educationSchema = new mongoose.Schema(
  { degree: String, institution: String, year: String },
  { _id: false }
);

const experienceSchema = new mongoose.Schema(
  { title: String, company: String, duration: String, description: String },
  { _id: false }
);

const skillsField = () => [{ type: String, lowercase: true, trim: true }];

module.exports = { educationSchema, experienceSchema, skillsField };