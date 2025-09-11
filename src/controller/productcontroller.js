const Product = require("../model/product");
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

// ✅ Get all products
exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find();
    if (!products.length) {
      return res.status(404).json({ message: "No products found" });
    }
    res.status(200).json({ success: true, data: products });
  } catch (error) {
    console.log("Failed to get products", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Get product by ID
exports.getProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    res.status(200).json({ success: true, data: product });
  } catch (error) {
    console.log("Failed to get product", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Get latest 10 products
exports.getLatestproduct = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 }).limit(10);
    return res.status(200).json({ success: true, data: products });
  } catch (error) {
    console.log("Failed to get latest products", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Get distinct categories
exports.getAllCategroies = async (req, res) => {
  try {
    const categories = await Product.distinct("categories");
    return res.status(200).json({ success: true, data: categories });
  } catch (error) {
    console.log("Failed to get categories", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Search + pagination
exports.searchProducts = async (req, res) => {
  try {
    const { search } = req.query;
    const basequery = {};

    if (search) {
      basequery.$or = [
        { name: { $regex: search, $options: "i" } },
        { brand: { $regex: search, $options: "i" } },
        { categories: { $regex: search, $options: "i" } },
      ];
    }

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const products = await Product.find(basequery).skip(skip).limit(limit);
    const totalProducts = await Product.countDocuments(basequery);

    if (!products.length) {
      return res.status(404).json({ message: "No products found" });
    }

    res.status(200).json({
      success: true,
      page,
      limit,
      totalProducts,
      totalPages: Math.ceil(totalProducts / limit),
      data: products,
    });
  } catch (error) {
    console.error("Failed to search products", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Add product (supports file upload + JSON URLs)
exports.addProduct = async (req, res) => {
  try {
    let imageUrls = [];

    // 1. Handle uploaded files
    if (req.files && req.files.length > 0) {
      const uploadPromises = req.files.map((file) => streamUpload(file));
      const results = await Promise.all(uploadPromises);
      imageUrls = results.map((r) => r.secure_url);
    }

    // 2. Handle JSON image URLs
    if (req.body.images) {
      let parsed = req.body.images;

      if (typeof parsed === "string") {
        try {
          parsed = JSON.parse(parsed);
        } catch {
          parsed = [parsed];
        }
      }

      if (Array.isArray(parsed)) {
        imageUrls = [...imageUrls, ...parsed];
      }
    }

    const productData = {
      ...req.body,
      images: imageUrls,
    };

    const product = new Product(productData);
    await product.save();

    res.status(201).json({
      success: true,
      message: "Product added",
      data: product,
    });
  } catch (error) {
    console.error("Add product failed", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Update product
exports.updateProduct = async (req, res) => {
  try {
    let imageUrls = [];

    if (req.files && req.files.length > 0) {
      const uploadPromises = req.files.map((file) => streamUpload(file));
      const results = await Promise.all(uploadPromises);
      imageUrls = results.map((r) => r.secure_url);
    }

    if (req.body.images) {
      let parsed = req.body.images;
      if (typeof parsed === "string") {
        try {
          parsed = JSON.parse(parsed);
        } catch {
          parsed = [parsed];
        }
      }
      if (Array.isArray(parsed)) {
        imageUrls = [...imageUrls, ...parsed];
      }
    }

    const updateData = { ...req.body };
    if (imageUrls.length > 0) {
      updateData.images = imageUrls;
    }

    const updated = await Product.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
    });

    if (!updated) return res.status(404).json({ message: "Product not found" });

    res.status(200).json({
      success: true,
      message: "Product updated",
      data: updated,
    });
  } catch (error) {
    console.error("Update product failed", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Delete product
exports.deleteProduct = async (req, res) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Product not found" });

    res.status(200).json({ success: true, message: "Product deleted" });
  } catch (error) {
    console.error("Delete product failed", error);
    res.status(500).json({ message: "Server error" });
  }
};
