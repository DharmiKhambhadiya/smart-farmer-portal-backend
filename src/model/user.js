const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isVerified: { type: Boolean, default: false },
  resetToken: String,
  resetTokenExpiry: Date,
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
  firstName: String,
  lastName: String,
  city: String,
  phoneNumber: String,
  address: {
    street: String,
    state: String,
    pincode: String,
  },
});
module.exports = mongoose.model("User", userSchema);
