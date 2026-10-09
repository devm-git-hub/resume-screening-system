// // controllers/candidateController.js
// const Candidate = require("../models/Candidate");

// // @route  GET /api/candidates/:id
// const getCandidateById = async (req, res, next) => {
//   try {
//     const candidate = await Candidate.findById(req.params.id)
//       .populate("user", "name email")
//       .populate("activeResume");
//     if (!candidate) return res.status(404).json({ success: false, message: "Candidate not found" });
//     res.status(200).json({ success: true, data: candidate });
//   } catch (error) {
//     next(error);
//   }
// };

// // @route  GET /api/candidates?skills=react,node&minExperience=2&search=john&page=1&limit=10
// // @desc   Search & filter candidates (recruiter tool)
// const searchCandidates = async (req, res, next) => {
//   try {
//     const { skills, minExperience, search, page = 1, limit = 10 } = req.query;
//     const query = {};

//     if (skills) {
//       const skillList = skills.split(",").map((s) => s.trim().toLowerCase());
//       query.skills = { $in: skillList };
//     }
//     if (minExperience) {
//       query.totalExperienceYears = { $gte: Number(minExperience) };
//     }

//     let candidatesQuery = Candidate.find(query)
//       .populate("user", "name email")
//       .skip((page - 1) * limit)
//       .limit(Number(limit))
//       .sort("-createdAt");

//     if (search) {
//       candidatesQuery = Candidate.find({
//         ...query,
//       })
//         .populate({ path: "user", match: { name: new RegExp(search, "i") } })
//         .skip((page - 1) * limit)
//         .limit(Number(limit));
//     }

//     const candidates = await candidatesQuery;
//     const filtered = search ? candidates.filter((c) => c.user) : candidates;
//     const total = await Candidate.countDocuments(query);

//     res.status(200).json({
//       success: true,
//       data: filtered,
//       pagination: { total, page: Number(page), pages: Math.ceil(total / limit) },
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// // @route  PUT /api/candidates/me
// // @access Private (candidate)
// const updateMyProfile = async (req, res, next) => {
//   try {
//     const candidate = await Candidate.findOneAndUpdate(
//       { user: req.user._id },
//       req.body,
//       { new: true, runValidators: true }
//     );
//     res.status(200).json({ success: true, data: candidate });
//   } catch (error) {
//     next(error);
//   }
// };

// module.exports = { getCandidateById, searchCandidates, updateMyProfile };




// controllers/candidateController.js
const Candidate = require("../models/Candidate");
const User = require("../models/User");
const { getPagination, buildPagination } = require("../utils/paginate");

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const EDITABLE_FIELDS = ["phone", "location", "headline", "skills", "education", "experience", "totalExperienceYears"];

// @route  GET /api/candidates/:id
const getCandidateById = async (req, res, next) => {
  try {
    const candidate = await Candidate.findById(req.params.id).populate("user", "name email").populate("activeResume");
    if (!candidate) return res.status(404).json({ success: false, message: "Candidate not found" });
    res.status(200).json({ success: true, data: candidate });
  } catch (error) {
    next(error);
  }
};

// @route  GET /api/candidates?skills=react,node&minExperience=2&search=john
const searchCandidates = async (req, res, next) => {
  try {
    const { skills, minExperience, search } = req.query;
    const { page, limit, skip } = getPagination(req.query);
    const query = {};

    if (skills) query.skills = { $in: skills.split(",").map((s) => s.trim().toLowerCase()) };
    if (minExperience) query.totalExperienceYears = { $gte: Number(minExperience) };
    if (search) {
      const users = await User.find({ name: new RegExp(escapeRegex(search), "i") }).select("_id");
      query.user = { $in: users.map((u) => u._id) };
    }

    const [candidates, total] = await Promise.all([
      Candidate.find(query).populate("user", "name email").sort("-createdAt").skip(skip).limit(limit),
      Candidate.countDocuments(query),
    ]);

    res.status(200).json({ success: true, data: candidates, pagination: buildPagination(total, page, limit) });
  } catch (error) {
    next(error);
  }
};

// @route  PUT /api/candidates/me
const updateMyProfile = async (req, res, next) => {
  try {
    const updates = {};
    EDITABLE_FIELDS.forEach((f) => {
      if (req.body[f] !== undefined) updates[f] = req.body[f];
    });
    const candidate = await Candidate.findByIdAndUpdate(req.candidate._id, updates, { new: true, runValidators: true });
    res.status(200).json({ success: true, data: candidate });
  } catch (error) {
    next(error);
  }
};

module.exports = { getCandidateById, searchCandidates, updateMyProfile };