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

// Get All Contact Requests (Admin only)
exports.getAllRequest = async (req, res) => {
  try {
    const requests = await Contact.find().sort({ createdAt: -1 });
    if (!requests.length) {
      return res.status(404).json({ message: "No requests found" });
    }
    res.status(200).json({ success: true, data: requests });
  } catch (error) {
    console.error("Failed to get requests", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get Request By ID (Admin only)
exports.getRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const request = await Contact.findById(id);
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
      <p>Dear ${request.name},</p>
      <p>Thanks for contacting Smart Farmer Support.</p>
      <p><strong>Your Query:</strong> ${request.message}</p>
      <p><strong>Our Reply:</strong> ${replymessage}</p>
      <br/><p>Regards,<br/>Smart Farmer Team</p>
    `;

    await sendMail(request.email, `Re: ${request.subject}`, htmlMessage);

    res.status(200).json({ message: "Reply sent successfully" });
  } catch (error) {
    console.error("Failed to send reply", error);
    res.status(500).json({ message: "Server error while replying" });
  }
};
