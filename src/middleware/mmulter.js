  const multer = require("multer");
  const path = require("path");
  const fs = require("fs");

  // Ensure the Uploads folder exists
  const uploadDir = path.join(__dirname, "../../Uploads");
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadDir); // Save to Uploads folder
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, `${uniqueSuffix}${path.extname(file.originalname).toLowerCase()}`); // e.g., 1234567890.jpg
    },
  });

  const fileFilter = (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif|webp/i;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error("Only images (JPEG, PNG, GIF, WEBP) are allowed"), false);
    }
  };

  const upload = multer({
    storage,
    fileFilter,
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB limit per file
      files: 5, // Max 5 files
    },
  }).array("images", 5); // Expect "images" field, max 5 files

  // Middleware to handle multer errors
  const handleMulterError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({
          success: false,
          message: "File size exceeds 5MB limit",
        });
      }
      if (err.code === "LIMIT_FILE_COUNT") {
        return res.status(400).json({
          success: false,
          message: "Maximum 5 images allowed",
        });
      }
      return res.status(400).json({
        success: false,
        message: `Multer error: ${err.message}`,
      });
    }
    if (err.message === "Only images (JPEG, PNG, GIF) are allowed") {
      return res.status(400).json({
        success: false,
        message: err.message,
      });
    }
    next(err); // Pass other errors to the global error handler
  };

  module.exports = { upload, handleMulterError };
