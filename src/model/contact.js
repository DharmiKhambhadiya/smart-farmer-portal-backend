const mongoose = require("mongoose");

const contactSupportSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phoneNumber: { type: String },
    subject: { type: String },
    message: { type: String, required: true },

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
    timestamps: true, // Adds createdAt & updatedAt fields automatically
  }
);

module.exports = mongoose.model("ContactSupport", contactSupportSchema);
