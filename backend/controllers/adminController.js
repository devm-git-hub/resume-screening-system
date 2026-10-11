// controllers/adminController.js
// User management for the Admin panel. Every route using these is protected
// by protect + authorize("admin") in routes/adminRoutes.js.
const User = require("../models/User");
const { getPagination, buildPagination } = require("../utils/paginate");

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const ROLES = ["candidate", "recruiter", "admin"];

// @route  GET /api/admin/users?role=&status=&search=&page=&limit=
//   role:   candidate | recruiter | admin   (omit for all)
//   status: active | inactive               (omit for all)
//   search: matches name or email
// Also returns `summary` (counts over ALL users, not just the filtered page).
const getUsers = async (req, res, next) => {
  try {
    const { role, status, search } = req.query;
    const { page, limit, skip } = getPagination(req.query);

    const query = {};
    if (ROLES.includes(role)) query.role = role;
    if (status === "active") query.isActive = { $ne: false };
    if (status === "inactive") query.isActive = false;
    if (search) {
      const rx = new RegExp(escapeRegex(search), "i");
      query.$or = [{ name: rx }, { email: rx }];
    }

    const [users, total, grouped] = await Promise.all([
      User.find(query).sort("-createdAt").skip(skip).limit(limit),
      User.countDocuments(query),
      User.aggregate([
        {
          $group: {
            _id: "$role",
            count: { $sum: 1 },
            inactive: { $sum: { $cond: [{ $eq: ["$isActive", false] }, 1, 0] } },
          },
        },
      ]),
    ]);

    const summary = { total: 0, candidate: 0, recruiter: 0, admin: 0, inactive: 0 };
    grouped.forEach((g) => {
      summary[g._id] = g.count;
      summary.total += g.count;
      summary.inactive += g.inactive;
    });

    res.status(200).json({
      success: true,
      data: users,
      summary,
      pagination: buildPagination(total, page, limit),
    });
  } catch (error) {
    next(error);
  }
};

// @route  PATCH /api/admin/users/:id/status      body: { isActive: true | false }
// Deactivating signs the user out on their next request and blocks login
// until reactivated. Data is kept.
const setUserStatus = async (req, res, next) => {
  try {
    const { isActive } = req.body;
    if (typeof isActive !== "boolean") {
      return res.status(400).json({ success: false, message: "isActive must be true or false" });
    }
    if (String(req.params.id) === String(req.user._id)) {
      return res.status(400).json({ success: false, message: "You can't change your own account status" });
    }

    const target = await User.findById(req.params.id);
    if (!target) return res.status(404).json({ success: false, message: "User not found" });
    if (target.role === "admin") {
      return res.status(403).json({ success: false, message: "Admin accounts can't be deactivated here" });
    }

    const user = await User.findByIdAndUpdate(target._id, { isActive }, { new: true });

    res.status(200).json({
      success: true,
      message: isActive ? "Account reactivated" : "Account deactivated",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getUsers, setUserStatus };