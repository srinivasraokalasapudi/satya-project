const createHttpError = require("http-errors");

/**
 * Restricts a route to users whose role is in the allowed list.
 * Must be used AFTER isVerifiedUser (relies on req.user being set).
 *
 * Usage: router.post("/", isVerifiedUser, authorizeRoles("Admin"), handler)
 */
const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(createHttpError(401, "Please login to continue!"));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        createHttpError(
          403,
          "You do not have permission to perform this action. Admin access required."
        )
      );
    }

    next();
  };
};

// Convenience shortcut for the common "Admin only" case.
const isAdmin = authorizeRoles("Admin");

module.exports = { authorizeRoles, isAdmin };
