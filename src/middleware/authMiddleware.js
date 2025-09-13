const jwt = require("jsonwebtoken");
const User = require("../model/user");

exports.verifyToken = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.log("❌ No token provided in headers");
    return res.status(401).json({ message: "Token not provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("🔑 Token decoded successfully:", decoded); // Debug

    // Find user in database to ensure they exist
    const user = await User.findById(decoded.id || decoded.userid).select(
      "-password"
    );
    if (!user) {
      console.log("❌ User not found for ID:", decoded.id || decoded.userid);
      return res.status(401).json({ message: "User not found" });
    }

    // Set req.user with standardized id
    req.user = {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      ...decoded,
    };
    console.log("👤 User set in req.user:", req.user.id); // Debug
    next();
  } catch (err) {
    console.error("❌ Token verification failed:", err.message);
    return res.status(403).json({ message: "Invalid or expired token" });
  }
};
