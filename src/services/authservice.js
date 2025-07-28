const bcrypt = require("bcrypt");
const PendingUser = require("../model/pendinguser");
const { User } = require("../model/user");
const { sendMail } = require("./mailService");
const { generateOTP } = require("../utilities/otp");

exports.registerPendingUser = async ({ email, password, role }) => {
  const hashedPassword = await bcrypt.hash(password, 12);
  const otp = generateOTP();
  const otpexpiry = new Date(Date.now() + 5 * 60 * 1000);

  await PendingUser.create({
    email,
    password: hashedPassword,
    otp,
    otpexpiry,
    role,
  });

  const html = `<p>Your OTP is <strong>${otp}</strong>. It will expire in 5 minutes.</p>`;
  await sendMail(email, "Verify your Email - OTP Inside", html);
};

exports.validateNewRegistration = async (email) => {
  if (await User.findOne({ email })) {
    throw new Error("User already exists");
  }
  if (await PendingUser.findOne({ email })) {
    throw new Error("OTP already sent. Please verify.");
  }
};
