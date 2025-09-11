const jwt = require("jsonwebtoken");

exports.verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.log("❌ No token provided in headers");
    return res.status(401).json({ message: "Token not provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("🔑 Token decoded successfully:", decoded); // Debug log

    // Handle both 'id' and 'userid' in the token payload
    req.user = {
      id: decoded.id || decoded.userid || decoded._id, // Standardize to 'id'
      userid: decoded.id || decoded.userid || decoded._id, // Keep for backward compatibility
      ...decoded, // Include other fields like email, role, etc.
    };

    console.log("👤 User set in req.user:", req.user.id); // Debug log
    next();
  } catch (err) {
    console.error("❌ Token verification failed:", err.message);
    return res.status(403).json({ message: "Invalid token" });
  }
};
