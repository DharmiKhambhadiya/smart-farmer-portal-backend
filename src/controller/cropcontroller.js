const Crop = require("../model/crop");
const cloudinary = require("../utilities/cloudinary");

// Helper to upload buffer to Cloudinary
const streamUpload = (file) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "products" },
      (error, result) => {
        if (result) resolve(result);
        else reject(error);
      }
    );
    stream.end(file.buffer);
  });
};
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

//GET crop name and image

exports.GetList = async (req, res) => {
  try {
    const crops = await Crop.find({}, "name image");
    res.status(200).json({ success: true, data: crops });
  } catch (error) {
    console.error("Error fetching croplist:", error);
    res.status(500).json({ success: false, messare: "server errror" });
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

//get crop catgory
exports.getCategory = async (req, res) => {
  try {
    const crop = await Crop.distinct("category");
    return res.status(200).json({ success: true, data: crop });
  } catch (error) {
    console.log("failed to get category", error);
    res.status(500).json({ message: "server error" });
  }
};

//get latest crop
exports.getLatestCrop = async (req, res) => {
  try {
    const crop = await Crop.find({}).sort({ createdAt: -1 }).limit(10);
    res.status(200).json({ success: true, data: crop });
  } catch (error) {
    console.log("failed to get crop", error);
    res.status(500).json({ message: "server error" });
  }
};

// get filtered crop
exports.searchCrop = async (req, res) => {
  try {
    const { search } = req.query;
    const basequery = {};
    //  Search by name, brand, or categories
    if (search) {
      basequery.$or = [
        { name: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
      ];
    }
    // Pagination params
    const page = Number(req.query.page) || 1;
    const limit = 12;
    const skip = (page - 1) * limit;

    // Get paginated data
    const crop = await Crop.find(basequery).skip(skip).limit(limit);

    //  Get total count for pagination
    const totaldocuments = await Crop.countDocuments(basequery);

    if (!crop.length > 0)
      return res.status(404).json({ messasge: "crop not found" });

    //  Send response with pagination info
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
    res.status(500).json({ message: "server error" });
  }
};

// CREATE new crop
exports.createCrop = async (req, res) => {
  try {
    let imageUrls = [];

    // Upload images to Cloudinary
    if (req.files && req.files.length > 0) {
      const uploadPromises = req.files.map((file) => streamUpload(file));
      const results = await Promise.all(uploadPromises);
      imageUrls = results.map((r) => r.secure_url);
    }

    // Build crop data
    const cropData = {
      ...req.body,
      images: imageUrls,
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

//Get All Crop
exports.GetCrop = async (req, res) => {
  try {
    const crop = await Crop.find();
    if (!crop) {
      res.status(404).json({ message: "There is no Crop Found" });
    }
  } catch (error) {
    console.log("Failed to Get Crop Details", error);
    res.status(500).json({ message: "server error" });
  }
};
// UPDATE crop by ID
exports.updateCrop = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedCrop = await Crop.findByIdAndUpdate(id, req.body, {
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
