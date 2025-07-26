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
