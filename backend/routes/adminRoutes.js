// routes/adminRoutes.js
const express = require("express");
const router = express.Router();
const { getUsers, setUserStatus } = require("../controllers/adminController");
const { protect, authorize } = require("../middleware/auth");

// everything below is admin-only
router.use(protect, authorize("admin"));

router.get("/users", getUsers);
router.patch("/users/:id/status", setUserStatus);

module.exports = router;