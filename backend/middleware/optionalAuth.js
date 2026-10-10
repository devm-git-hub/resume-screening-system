// middleware/optionalAuth.js
// Like `protect`, but never rejects: if a valid token is sent, req.user is set;
// otherwise the request just continues as a guest. Used on public routes that
// want to know "who is asking" (e.g. to mark which jobs belong to the viewer).
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const optionalAuth = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (header && header.startsWith("Bearer ")) {
      const decoded = jwt.verify(header.split(" ")[1], process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      if (user && user.isActive) req.user = user;
    }
  } catch (error) {
    // invalid / expired token => treat as a guest
  }
  next();
};

module.exports = optionalAuth;