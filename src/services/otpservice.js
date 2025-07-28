const { User } = require("../model/user");
const PendingUser = require("../model/pendinguser");

exports.verifyOTPAndCreateUser = async ({ email, otp, role }) => {
  const pendingUser = await PendingUser.findOne({ email });
  if (!pendingUser) throw new Error("User not found or already verified");

  if (pendingUser.otp !== otp) throw new Error("Invalid OTP");
  if (Date.now() > pendingUser.otpexpiry) {
    await PendingUser.deleteOne({ email });
    throw new Error("OTP expired");
  }

  const newUser = new User({
    email: pendingUser.email,
    password: pendingUser.password,
    isVerified: true,
    role: pendingUser.role || role,
  });

  await newUser.save();
  await PendingUser.deleteOne({ email });
  return newUser;
};
