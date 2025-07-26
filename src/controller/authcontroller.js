const { User } = require("../model/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { sendMail } = require("../services/mailservice");
const { generateResetToken } = require("../utilities/hashutility");
const PendingUser = require("../model/pendinguser");

const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

const generateToken = (user) => {
  return jwt.sign(
    { userid: user._id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );
};

// Registration

exports.registerUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const existingPending = await PendingUser.findOne({ email });
    if (existingPending) {
      return res
        .status(400)
        .json({ message: "OTP already sent. Please verify." });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const otp = generateOTP();
    const otpexpiry = new Date(Date.now() + 5 * 60 * 1000);

    await PendingUser.create({
      email,
      password: hashedPassword,
      otp,
      otpexpiry,
    });

    sendMail(
      email,
      "Verify your Email - OTP Inside",
      `<p>Your OTP is <strong>${otp}</strong>. It will expire in 5 minutes.</p>`
    );

    return res
      .status(200)
      .json({ message: "OTP sent to email for verification" });
  } catch (err) {
    console.error(" Registration Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// OTP Verify
exports.verifyOTP = async (req, res) => {
  console.log(req.body);
  const { email, otp } = req.body;
  try {
    const pendingUser = await PendingUser.findOne({ email });

    if (!pendingUser) {
      return res
        .status(404)
        .json({ message: "User not found or already verified" });
    }

    if (pendingUser.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (Date.now() > pendingUser.otpexpiry) {
      await PendingUser.deleteOne({ email }); // Clean expired entry
      return res.status(400).json({ message: "OTP expired" });
    }

    const newUser = new User({
      email: pendingUser.email,
      password: pendingUser.password,
      isVerified: true,
    });

    await newUser.save();
    await PendingUser.deleteOne({ email });

    return res.status(200).json({ message: "Email verified successfully" });
  } catch (err) {
    console.error(" OTP Verification Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

//  Login
exports.loginUser = async (req, res) => {
  if (!req.body || !req.body.email || !req.body.password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user || !user.isVerified)
      return res
        .status(400)
        .json({ message: "Invalid credentials or email not verified" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid email or password" });

    const token = generateToken(user);

    return res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        email: user.email,
      },
    });
  } catch (err) {
    console.error(" Login Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

//  Get Profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userid).select(
      "-password -otp -otpexpiry"
    );
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ user });
  } catch (err) {
    console.error(" Get Profile Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Change Password (Logged-in user)
exports.changePassword = async (req, res) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;

  if (!currentPassword || !newPassword || !confirmPassword) {
    return res.status(400).json({ message: "All fields are required" });
  }

  if (newPassword !== confirmPassword)
    return res.status(400).json({ message: "Passwords do not match" });

  try {
    const user = await User.findById(req.user.userid);
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Incorrect current password" });

    const isSame = await bcrypt.compare(newPassword, user.password);
    if (isSame)
      return res
        .status(400)
        .json({ message: "New password must be different" });

    user.password = await bcrypt.hash(newPassword, 12);
    await user.save();

    res.status(200).json({ message: "Password changed successfully" });
  } catch (err) {
    console.error("Change Password Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Send Reset Password Link
exports.sendResetPasswordLink = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });
    if (!user.isVerified)
      return res.status(400).json({ message: "Email not verified" });

    const rawToken = generateResetToken(user);

    await user.save();

    const resetLink = `http://localhost:3000/reset-password/${rawToken}`;
    const html = `<h3>Reset Password</h3><p>Click the link below. Valid for 5 minutes.</p><a href="${resetLink}">Reset Password</a>`;

    sendMail(email, "Reset Your Password", html);

    res.status(200).json({ message: "Reset password link sent to email" });
    console.log(rawToken);
  } catch (err) {
    console.error(" Send Reset Password Link Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

//  Reset Password with Token
exports.ResetPassword = async (req, res) => {
  const { token } = req.params;

  if (!req.body) {
    return res.status(400).json({ message: "Request body is missing" });
  }

  const { newpassword, confirmPassword } = req.body;

  if (!newpassword || !confirmPassword) {
    return res
      .status(400)
      .json({ message: "New and confirm passwords are required" });
  }

  if (newpassword !== confirmPassword) {
    return res.status(400).json({ message: "Passwords do not match" });
  }

  try {
    const hashedToken = require("crypto")
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const user = await User.findOne({
      resetToken: hashedToken,
      resetTokenExpiry: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    user.password = await bcrypt.hash(newpassword, 12);
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;

    await user.save();

    res.status(200).json({ message: "Password reset successful" });
  } catch (err) {
    console.error(" Reset Password Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
