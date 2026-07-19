// controllers/authController.js
const User = require("../models/User");
const Candidate = require("../models/Candidate");
const Recruiter = require("../models/Recruiter");
const { generateAccessToken, generateRefreshToken } = require("../utils/generateToken");

// @route  POST /api/auth/register
// @access Public
const register = async (req, res, next) => {
  try {
    const { name, email, password, role, companyName, phone } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ success: false, message: "name, email, password, role are required" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, message: "Email already registered" });
    }

    const user = await User.create({ name, email, password, role });

    // Create role-specific profile
    if (role === "candidate") {
      await Candidate.create({ user: user._id, phone });
    } else if (role === "recruiter") {
      if (!companyName) {
        return res.status(400).json({ success: false, message: "companyName is required for recruiters" });
      }
      await Recruiter.create({ user: user._id, companyName });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    res.status(201).json({
      success: true,
      message: "Registration successful",
      data: { user: user.toSafeObject(), accessToken, refreshToken },
    });
  } catch (error) {
    next(error);
  }
};

// @route  POST /api/auth/login
// @access Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "email and password are required" });
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    user.lastLogin = new Date();
    await user.save();

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: { user: user.toSafeObject(), accessToken, refreshToken },
    });
  } catch (error) {
    next(error);
  }
};

// @route  GET /api/auth/me
// @access Private
const getMe = async (req, res, next) => {
  try {
    res.status(200).json({ success: true, data: req.user.toSafeObject() });
  } catch (error) {
    next(error);
  }
};

// @route  POST /api/auth/refresh
// @access Public (requires valid refresh token)
const refresh = async (req, res, next) => {
  try {
    const jwt = require("jsonwebtoken");
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ success: false, message: "refreshToken is required" });
    }
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(401).json({ success: false, message: "Invalid refresh token" });

    const accessToken = generateAccessToken(user);
    res.status(200).json({ success: true, data: { accessToken } });
  } catch (error) {
    return res.status(401).json({ success: false, message: "Invalid or expired refresh token" });
  }
};

module.exports = { register, login, getMe, refresh };
