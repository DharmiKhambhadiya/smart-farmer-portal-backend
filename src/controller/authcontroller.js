// controllers/authController.js

const User = require("../model/user");
const {
  validateNewRegistration,
  registerPendingUser,
  resendOTPForPendingUser,
} = require("../services/authservice");
const { verifyOTPAndCreateUser } = require("../services/otpservice");
const { sendResetPasswordEmail } = require("../services/mailservice");
const { generateResetToken } = require("../utilities/hashutility");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

// Utility to generate JWT
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "24h" }
  );
};

// --- Register (User/Admin)
exports.register = async (req, res) => {
  const { email, password, role = "user" } = req.body;

  try {
    await validateNewRegistration(email);
    await registerPendingUser({ email, password, role });
    res.status(200).json({ message: "OTP sent to email for verification" });
  } catch (err) {
    console.error("Register Error:", err);
    res.status(400).json({ message: err.message });
  }
};

// --- Verify OTP (User/Admin)
exports.verifyOTP = async (req, res) => {
  const { email, otp, role = "user" } = req.body;

  try {
    const user = await verifyOTPAndCreateUser({ email, otp, role });

    res.status(200).json({
      message: "Email verified successfully",
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Verify OTP Error:", err);
    res.status(400).json({ message: err.message });
  }
};

// --- Resend OTP
exports.resendOTP = async (req, res) => {
  const { email } = req.body;

  try {
    await resendOTPForPendingUser(email);
    res.status(200).json({ message: "New OTP sent to email" });
  } catch (err) {
    console.error("Resend OTP Error:", err);
    res.status(400).json({ message: err.message });
  }
};

// --- Login (User/Admin)
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user || !user.isVerified) {
      return res
        .status(400)
        .json({ message: "Invalid credentials or email not verified" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid email or password" });

    const token = generateToken(user);

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// --- Get Profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select(
      "-password -otp -otpexpiry"
    );
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ user });
  } catch (err) {
    console.error("Get Profile Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// --- Admin: Get All Users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ role: "user" }).select(
      "-password -otp -otpexpiry -resetToken -resetTokenExpiry"
    );
    res.status(200).json({ success: true, users });
  } catch (err) {
    console.error("Get All Users Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// --- Admin: Get User By Id
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).select(
      "-password -otp -otpexpiry -resetToken -resetTokenExpiry"
    );
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    console.log("Failed to Get User", error);
    res.status(500).json({ message: "server error" });
  }
};

// --- Admin: Update a User
exports.updateUserByAdmin = async (req, res) => {
  const { id } = req.params;
  const { name, role, isVerified } = req.body;

  try {
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (name) user.name = name;
    if (role) user.role = role;
    if (typeof isVerified === "boolean") user.isVerified = isVerified;

    await user.save();
    res.status(200).json({ message: "User updated successfully", user });
  } catch (err) {
    console.error("Update User Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// --- Admin: Delete a User
exports.deleteUserByAdmin = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findByIdAndDelete(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ message: "User deleted successfully" });
  } catch (err) {
    console.error("Delete User Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// --- Change Password
exports.changePassword = async (req, res) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;

  if (!currentPassword || !newPassword || !confirmPassword)
    return res.status(400).json({ message: "All fields are required" });

  if (newPassword !== confirmPassword)
    return res.status(400).json({ message: "Passwords do not match" });

  try {
    const user = await User.findById(req.user.id);
    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isMatch)
      return res.status(400).json({ message: "Incorrect current password" });

    if (await bcrypt.compare(newPassword, user.password))
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

// --- Send Reset Link
exports.sendResetPasswordLink = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user || !user.isVerified) {
      return res
        .status(400)
        .json({ message: "User not found or email not verified" });
    }

    const rawToken = generateResetToken(user);
    await user.save();

    await sendResetPasswordEmail(email, rawToken);
    res.status(200).json({ message: "Reset link sent to email" });
  } catch (err) {
    console.error("Send Reset Link Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// --- Reset Password
exports.resetPassword = async (req, res) => {
  const { token } = req.params;
  const { newPassword, confirmPassword } = req.body;

  if (!newPassword || !confirmPassword)
    return res.status(400).json({ message: "All fields are required" });

  if (newPassword !== confirmPassword)
    return res.status(400).json({ message: "Passwords do not match" });

  try {
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetToken: hashedToken,
      resetTokenExpiry: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Token invalid or expired" });
    }

    user.password = await bcrypt.hash(newPassword, 12);
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();

    res.status(200).json({ message: "Password reset successful" });
  } catch (err) {
    console.error("Reset Password Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};


//----user update their profile
exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const { firstName, lastName, city, phoneNumber, address } = req.body;

    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (city) user.city = city;
    if (phoneNumber) user.phoneNumber = phoneNumber;
    if (address) {
      user.address = {
        ...user.address,
        ...address,
      };
    }

    await user.save();

    res.status(200).json({
      message: "Profile updated successfully",
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        city: user.city,
        phoneNumber: user.phoneNumber,
        address: user.address,
      },
    });
  } catch (err) {
    console.error("Update Profile Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
