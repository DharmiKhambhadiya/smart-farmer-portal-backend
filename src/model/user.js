const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isVerified: { type: Boolean, default: false },
  resetToken: String,
  resetTokenExpiry: Date,
  //profile
  firstName: { type: String },
  lastName: { type: String },
  city: { type: String },
  phoneNumber: { type: String },
  address: {
    street: { type: String },
    state: { type: String },
    pincode: { type: String },
  },
});

exports.User = mongoose.model("User", userSchema);
