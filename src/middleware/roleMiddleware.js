exports.authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Access Denied: Requires role(s): ${allowedRoles.join(", ")}`,
      });
    }
    next();
  };
};
