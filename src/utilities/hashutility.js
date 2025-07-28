const crypto = require("crypto");

exports.generateResetToken = (user) => {
  const rawToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto
    .createHash("sha256")
    .update(rawToken)
    .digest("hex");
  user.resetToken = hashedToken;
  user.resetTokenExpiry = Date.now() + 5 * 60 * 1000;
  return rawToken;
};
