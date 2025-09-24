const bcrypt = require("bcrypt");
const PendingUser = require("../model/pendinguser");
const User = require("../model/user");
const { sendMail } = require("./mailservice");
const { generateOTP } = require("../utilities/otp");

exports.registerPendingUser = async ({ email, password, role }) => {
  console.log("🔄 Starting registration for:", email);

  const hashedPassword = await bcrypt.hash(password, 12);
  const otp = generateOTP();
  const otpexpiry = new Date(Date.now() + 5 * 60 * 1000);

  console.log("🔢 Generated OTP:", otp);

  await PendingUser.create({
    email,
    password: hashedPassword,
    otp,
    otpexpiry,
    role,
  });

  console.log("💾 Pending user created in database");

  const html = `<p>Your OTP is <strong>${otp}</strong>. It will expire in 5 minutes.</p>`;

  console.log("📧 Attempting to send email to:", email);
  try {
    await sendMail(email, "Verify your Email - OTP Inside", html);
    console.log("✅ Email sent successfully!");
  } catch (error) {
    console.error("❌ Email sending failed:", error.message);
    throw new Error(`Failed to send OTP email: ${error.message}`);
  }
};

exports.validateNewRegistration = async (email) => {
  if (await User.findOne({ email })) {
    throw new Error("User already exists");
  }
  if (await PendingUser.findOne({ email })) {
    throw new Error("OTP already sent. Please verify.");
  }
};

exports.resendOTPForPendingUser = async (email) => {
  const pendingUser = await PendingUser.findOne({ email });
  if (!pendingUser) {
    throw new Error("No pending registration found for this email");
  }

  // Generate new OTP and expiry
  const otp = generateOTP();
  const otpexpiry = new Date(Date.now() + 5 * 60 * 1000);

  // Update the pending user with new OTP
  pendingUser.otp = otp;
  pendingUser.otpexpiry = otpexpiry;
  await pendingUser.save();

  // Send new OTP email
  const html = `<p>Your new OTP is <strong>${otp}</strong>. It will expire in 5 minutes.</p>`;
  await sendMail(email, "New OTP - Verify your Email", html);
};
