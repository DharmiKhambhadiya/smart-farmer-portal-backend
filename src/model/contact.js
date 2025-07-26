const mongoose = require("mongoose");

const contactSupportSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String },
  subject: { type: String, required: true },
  message: { type: String, required: true },
  replyMessage: { type: String },
  status: { type: String, enum: ["pending", "resolved"], default: "pending" },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("ContactSupport", contactSupportSchema);
