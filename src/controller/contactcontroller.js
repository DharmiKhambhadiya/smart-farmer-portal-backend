const Contact = require("../model/contact");

//Create New Message=User

exports.createMess = async (req, res) => {
  try {
    const { name, phonenumber, message, email, subject } = req.body;
    const userid = req.user?._id || null;
    const newmess = await Contact.create({
      name,
      phonenumber,
      message,
      subject,
      email,
      userid,
    });
    if (!newmess)
      return res.status(404).json({ message: "Failed to create new message" });

    await newmess.save();
    res.status(200).json({
      success: true,
      messgae: "Successfully  create new message",
      data: newmess,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "server error" });
  }
};

//Get All Request For Admin

exports.getAllRequest = async (req, res) => {
  try {
    const userid = req.user._id;
    const request = await Contact.findOne({ user: userid });
    if (!request) return res.status(404).json({ messge: "No Request" });

    res.status(200).json({ success: true, message: "Request", data: request });
  } catch (error) {
    console.log("Failed to get request", error);
    res.status(500).json({ message: "server error" });
  }
};

//Get Request By Id

exports.getRequest = async (req, res) => {
  try {
    const { id } = req.params.id;
    const request = await Contact.findById({ id });
    if (!request) return res.status(404).json({ message: "request not found" });

    await res
      .status(200)
      .json({ success: true, message: "get request", data: request });
  } catch (error) {
    console.log("Failed to get Request", error);
    res.status(500).json({ message: "server error" });
  }
};

//Reply to Request

exports.replyRequest = async (req, res) => {
  try {
    const { replymessage } = req.body;
    const request = await Contact.findById(req.params.id);
    if (!request) return res.status(404).json({ message: "user not found" });
  } catch (error) {
    console.log("failed to update request and send to user", error);
    res.status(500).json({ message: "server error" });
  }
};
