// controllers/authController.js
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Candidate = require("../models/Candidate");
const Recruiter = require("../models/Recruiter");
const { generateAccessToken, generateRefreshToken } = require("../utils/generateToken");

const sendAuthResponse = (res, status, message, user) =>
  res.status(status).json({
    success: true,
    message,
    data: {
      user: user.toSafeObject(),
      accessToken: generateAccessToken(user),
      refreshToken: generateRefreshToken(user),
    },
  });

// @route  POST /api/auth/register
const register = async (req, res, next) => {
  try {
    const { name, email, password, role, companyName, phone } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ success: false, message: "name, email, password, role are required" });
    }
    if (role === "recruiter" && !companyName) {
      return res.status(400).json({ success: false, message: "companyName is required for recruiters" });
    }
    if (await User.findOne({ email })) {
      return res.status(400).json({ success: false, message: "Email already registered" });
    }

    const user = await User.create({ name, email, password, role });

    if (role === "candidate") await Candidate.create({ user: user._id, phone });
    if (role === "recruiter") await Recruiter.create({ user: user._id, companyName });

    sendAuthResponse(res, 201, "Registration successful", user);
  } catch (error) {
    next(error);
  }
};

// @route  POST /api/auth/login
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

    sendAuthResponse(res, 200, "Login successful", user);
  } catch (error) {
    next(error);
  }
};

// @route  GET /api/auth/me
const getMe = async (req, res) => {
  res.status(200).json({ success: true, data: req.user.toSafeObject() });
};

// @route  POST /api/auth/refresh
const refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ success: false, message: "refreshToken is required" });
    }
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(401).json({ success: false, message: "Invalid refresh token" });

    res.status(200).json({ success: true, data: { accessToken: generateAccessToken(user) } });
  } catch (error) {
    res.status(401).json({ success: false, message: "Invalid or expired refresh token" });
  }
};

module.exports = { register, login, getMe, refresh };