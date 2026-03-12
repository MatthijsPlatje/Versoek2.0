// server/middleware/adminAuth.js

// This middleware MUST run *after* the regular 'auth' middleware.
const adminAuth = (req, res, next) => {
  // The 'auth' middleware should have already placed the user payload from the token onto req.user.
  // We can trust this payload because the token's signature has been verified.
  if (req.user && req.user.isAdmin) {
    // If the user object exists on the request and has the isAdmin flag, proceed.
    next();
  } else {
    // If not, deny access.
    res.status(403).json({ msg: 'Access denied. Admin privileges required.' });
  }
};

module.exports = adminAuth;
