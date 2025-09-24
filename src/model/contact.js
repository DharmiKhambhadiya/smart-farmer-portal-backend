// models/contact.js
const mongoose = require("mongoose");

const contactSupportSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phonenumber: { type: String }, // Changed from phoneNumber to phonenumber to match controller
    subject: { type: String, required: true },
    message: { type: String, required: true },
    replyMessage: { type: String }, // Add this field for storing replies

    status: {
      type: String,
      enum: ["pending", "resolved"],
      default: "pending",
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("ContactSupport", contactSupportSchema);
