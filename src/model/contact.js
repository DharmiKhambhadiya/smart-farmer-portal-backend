const mongoose = require("mongoose");

const contactSupportSchema = new mongoose.Schema({
  name: String,
  email: String,
  phonenumber: String,
  subject: String,
  message: String,
  replyMessage: String,
  status: { type: String, enum: ["pending", "resolved"], default: "pending" },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("ContactSupport", contactSupportSchema);
