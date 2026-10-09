// middleware/profile.js
// Loads the logged-in user's Candidate / Recruiter profile onto req.
const Candidate = require("../models/Candidate");
const Recruiter = require("../models/Recruiter");

const attachProfile = (Model, key, label) => async (req, res, next) => {
  try {
    const profile = await Model.findOne({ user: req.user._id });
    if (!profile) {
      return res.status(404).json({ success: false, message: `${label} profile not found` });
    }
    req[key] = profile;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  attachCandidate: attachProfile(Candidate, "candidate", "Candidate"),
  attachRecruiter: attachProfile(Recruiter, "recruiter", "Recruiter"),
};