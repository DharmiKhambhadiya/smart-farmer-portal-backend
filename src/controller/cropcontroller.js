const Crop = require("../model/crop");

// GET all crops
exports.getCrops = async (req, res) => {
  try {
    const crops = await Crop.find();
    res.status(200).json({ success: true, data: crops });
  } catch (error) {
    console.error(" Error fetching crops:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// GET crop name and image
exports.GetList = async (req, res) => {
  try {
    const crops = await Crop.find({}, "name imageUrl");
    res.status(200).json({ success: true, data: crops });
  } catch (error) {
    console.error("Error fetching croplist:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// GET crop by ID
exports.getCrop = async (req, res) => {
  try {
    const { id } = req.params;
    const crop = await Crop.findById(id);
    if (!crop) {
      return res
        .status(404)
        .json({ success: false, message: "Crop not found" });
    }
    res.status(200).json({ success: true, data: crop });
  } catch (error) {
    console.error("Error fetching crop by ID:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get crop category
exports.getCategory = async (req, res) => {
  try {
    const crop = await Crop.distinct("category");
    return res.status(200).json({ success: true, data: crop });
  } catch (error) {
    console.log("Failed to get category", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get latest crop
exports.getLatestCrop = async (req, res) => {
  try {
    const crop = await Crop.find({}).sort({ createdAt: -1 }).limit(10);
    res.status(200).json({ success: true, data: crop });
  } catch (error) {
    console.log("Failed to get crop", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get filtered crop
exports.searchCrop = async (req, res) => {
  try {
    const { search } = req.query;
    const basequery = {};

    if (search) {
      basequery.$or = [
        { name: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
      ];
    }

    const page = Number(req.query.page) || 1;
    const limit = 12;
    const skip = (page - 1) * limit;

    const crop = await Crop.find(basequery).skip(skip).limit(limit);
    const totaldocuments = await Crop.countDocuments(basequery);

    if (!crop.length) {
      return res.status(404).json({ message: "Crop not found" });
    }

    res.status(200).json({
      success: true,
      page,
      limit,
      totaldocuments,
      totalpages: Math.ceil(totaldocuments / limit),
      data: crop,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};

// CREATE new crop (without Cloudinary)
exports.createCrop = async (req, res) => {
  try {
    let imageUrls = [];

    const BASE_URL = process.env.BASE_URL || `http://localhost:${process.env.PORT || 5000}`;
    if (req.files && req.files.length > 0) {
      imageUrls = req.files.map((file) => `${BASE_URL}/uploads/${file.filename}`);
    }

    // Parse JSON fields if they arrive as strings (from multipart/form-data)
    let lifecycle = req.body.lifecycle;
    let pestsAndDiseases = req.body.pestsAndDiseases;

    if (typeof lifecycle === "string") {
      try {
        lifecycle = JSON.parse(lifecycle);
      } catch (e) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid lifecycle JSON" });
      }
    }

    if (typeof pestsAndDiseases === "string") {
      try {
        pestsAndDiseases = JSON.parse(pestsAndDiseases);
      } catch (e) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid pestsAndDiseases JSON" });
      }
    }

    if (!imageUrls.length) {
      return res
        .status(400)
        .json({ success: false, message: "At least one image is required" });
    }

    const cropData = {
      ...req.body,
      lifecycle,
      pestsAndDiseases,
      imageUrl: imageUrls,
    };

    const crop = new Crop(cropData);
    await crop.save();

    res.status(201).json({
      success: true,
      message: "Crop created successfully",
      data: crop,
    });
  } catch (error) {
    console.error("Error creating crop:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get all crops (redundant version)
exports.GetCrop = async (req, res) => {
  try {
    const crop = await Crop.find();
    if (!crop) {
      return res.status(404).json({ message: "There is no Crop Found" });
    }
    res.status(200).json({ success: true, data: crop });
  } catch (error) {
    console.log("Failed to Get Crop Details", error);
    res.status(500).json({ message: "Server error" });
  }
};

// UPDATE crop by ID
exports.updateCrop = async (req, res) => {
  try {
    const { id } = req.params;

    // Fetch current crop to preserve existing images
    const current = await Crop.findById(id);
    if (!current) {
      return res
        .status(404)
        .json({ success: false, message: "Crop not found" });
    }

    // Start with existing images that frontend asked to keep
    let imageUrls = [];
    if (req.body.existingImages) {
      if (Array.isArray(req.body.existingImages)) {
        imageUrls = req.body.existingImages;
      } else if (typeof req.body.existingImages === "string") {
        // could be comma-separated or single value
        try {
          // Try JSON parse first (e.g., ["/Uploads/a.jpg", "/Uploads/b.jpg"])
          const parsed = JSON.parse(req.body.existingImages);
          imageUrls = Array.isArray(parsed) ? parsed : [req.body.existingImages];
        } catch (_) {
          imageUrls = req.body.existingImages
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);
        }
      }
    } else {
      // If not provided, assume none kept
      imageUrls = [];
    }

    // Append any newly uploaded images
    const BASE_URL = process.env.BASE_URL || `http://localhost:${process.env.PORT || 5000}`;
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map((file) => `${BASE_URL}/uploads/${file.filename}`);
      imageUrls = [...imageUrls, ...newImages];
    }

    if (!imageUrls.length) {
      return res
        .status(400)
        .json({ success: false, message: "At least one image is required" });
    }

    // Parse JSON fields if they arrive as strings
    let lifecycle = req.body.lifecycle;
    let pestsAndDiseases = req.body.pestsAndDiseases;
    if (typeof lifecycle === "string") {
      try {
        lifecycle = JSON.parse(lifecycle);
      } catch (e) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid lifecycle JSON" });
      }
    }
    if (typeof pestsAndDiseases === "string") {
      try {
        pestsAndDiseases = JSON.parse(pestsAndDiseases);
      } catch (e) {
        return res.status(400).json({
          success: false,
          message: "Invalid pestsAndDiseases JSON",
        });
      }
    }

    const updateData = {
      ...req.body,
      lifecycle,
      pestsAndDiseases,
      imageUrl: imageUrls,
    };

    const updatedCrop = await Crop.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedCrop) {
      return res
        .status(404)
        .json({ success: false, message: "Crop not found" });
    }

    res.status(200).json({ success: true, data: updatedCrop });
  } catch (error) {
    console.error("Error updating crop:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// DELETE crop by ID
exports.deleteCrop = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedCrop = await Crop.findByIdAndDelete(id);
    if (!deletedCrop) {
      return res
        .status(404)
        .json({ success: false, message: "Crop not found" });
    }
    res
      .status(200)
      .json({ success: true, message: "Crop deleted successfully" });
  } catch (error) {
    console.error("Error deleting crop:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
