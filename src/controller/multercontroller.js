// src/controller/multercontroller.js
const fs = require("fs");
const cloudinary = require("../../cloudinary");

const mulercontroller = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // Upload to cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "uploads", // optional folder name in Cloudinary
    });

    // remove local temp file
    fs.unlinkSync(req.file.path);

    res.status(200).json({
      message: "File uploaded successfully",
      url: result.secure_url,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = mulercontroller;
