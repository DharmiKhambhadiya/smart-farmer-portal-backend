// controllers/contactcontroller.js
const Contact = require("../model/contact");
const { sendMail } = require("../services/mailservice");

// Create New Message (User only)
exports.createMess = async (req, res) => {
  try {
    const { name, phonenumber, message, email, subject } = req.body;
    const userId = req.user.userid;

    const newMess = await Contact.create({
      name,
      phonenumber,
      message,
      subject,
      email,
      userId,
    });

    res.status(200).json({
      success: true,
      message: "Message sent successfully",
      data: newMess,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get All Contact Requests (Admin only) - Updated to populate user
exports.getAllRequest = async (req, res) => {
  try {
    const requests = await Contact.find()
      .populate("userId", "name email") // Populate user name and email
      .sort({ createdAt: -1 });

    if (!requests.length) {
      return res.status(404).json({ message: "No requests found" });
    }

    res.status(200).json({ success: true, data: requests });
  } catch (error) {
    console.error("Failed to get requests", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get Request By ID (Admin only) - Updated to populate user
exports.getRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const request = await Contact.findById(id).populate("userId", "name email");

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    res.status(200).json({ success: true, data: request });
  } catch (error) {
    console.error("Failed to get request", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Reply to Request (Admin only)
exports.replyRequest = async (req, res) => {
  try {
    const { replymessage } = req.body;
    const requestId = req.params.id;

    const request = await Contact.findById(requestId);
    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    request.replyMessage = replymessage;
    request.status = "resolved";
    await request.save();

    const htmlMessage = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2c3e50;">Smart Farmer Support</h2>
        <p>Dear ${request.name},</p>
        <p>Thank you for contacting Smart Farmer Support.</p>
        <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0;">
          <p><strong>Your Query:</strong></p>
          <p style="margin: 10px 0;">${request.message}</p>
        </div>
        <div style="background: #e8f5e8; padding: 15px; border-radius: 5px; margin: 15px 0;">
          <p><strong>Our Reply:</strong></p>
          <p style="margin: 10px 0;">${replymessage}</p>
        </div>
        <p>Best regards,<br><strong>Smart Farmer Team</strong></p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="color: #666; font-size: 12px;">
          This is an automated response. Please do not reply to this email.
        </p>
      </div>
    `;

    await sendMail(request.email, `Re: ${request.subject}`, htmlMessage);

    res.status(200).json({ message: "Reply sent successfully" });
  } catch (error) {
    console.error("Failed to send reply", error);
    res.status(500).json({ message: "Server error while replying" });
  }
};
