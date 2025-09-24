const Product = require("../model/product");
const path = require("path");
const fs = require("fs");

// Get all products
exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find();
    if (!products.length) {
      return res.status(404).json({ message: "No products found" });
    }
    res.status(200).json({ success: true, data: products });
  } catch (error) {
    console.error("Failed to get products:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get product by ID
exports.getProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.status(200).json({ success: true, data: product });
  } catch (error) {
    console.error("Failed to get product:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get latest 8 products
exports.getLatestproduct = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 }).limit(8);
    return res.status(200).json({ success: true, data: products });
  } catch (error) {
    console.error("Failed to get latest products:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get distinct categories
exports.getAllCategroies = async (req, res) => {
  try {
    const categories = await Product.distinct("categories");
    return res.status(200).json({ success: true, data: categories });
  } catch (error) {
    console.error("Failed to get categories:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Search + pagination
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
    console.error("Failed to search products:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Add product
exports.addProduct = async (req, res) => {
  try {
    const productdata = { ...req.body };
    let imageUrls = [];

    // Validate input
    if (
      !productdata.name ||
      !productdata.categories ||
      !productdata.brand ||
      !productdata.description ||
      !productdata.price ||
      productdata.price <= 0
    ) {
      if (req.files) {
        req.files.forEach((file) => {
          fs.unlink(
            path.join(__dirname, "../Uploads", file.filename),
            (err) => {
              if (err)
                console.error(`Failed to delete file ${file.filename}:`, err);
            }
          );
        });
      }
      return res.status(400).json({
        message:
          "Missing required fields: name, categories, brand, description, or valid price",
      });
    }

    // Handle uploaded images
    if (req.files && req.files.length > 0) {
      imageUrls = req.files.map(
        (file) => `http://localhost:5000/Uploads/${file.filename}`
      );
      console.log("New image URLs:", imageUrls);
    }

    // Handle existing images
    if (req.body.existingImages) {
      const existingImages = Array.isArray(req.body.existingImages)
        ? req.body.existingImages
        : req.body.existingImages
            .split(",")
            .map((url) => url.trim())
            .filter((url) => url && url.startsWith(`${BASE_URL}/Uploads`));
      imageUrls = [...imageUrls, ...existingImages];
      console.log("Existing images:", existingImages);
    }

    if (imageUrls.length === 0) {
      if (req.files) {
        req.files.forEach((file) => {
          fs.unlink(
            path.join(__dirname, "../Uploads", file.filename),
            (err) => {
              if (err)
                console.error(`Failed to delete file ${file.filename}:`, err);
            }
          );
        });
      }
      return res
        .status(400)
        .json({ message: "At least one image is required" });
    }

    if (imageUrls.length > 5) {
      if (req.files) {
        req.files.forEach((file) => {
          fs.unlink(
            path.join(__dirname, "../Uploads", file.filename),
            (err) => {
              if (err)
                console.error(`Failed to delete file ${file.filename}:`, err);
            }
          );
        });
      }
      return res.status(400).json({ message: "Maximum 5 images allowed" });
    }

    productdata.images = imageUrls;
    delete productdata.existingImages;

    const product = new Product(productdata);
    await product.save();

    res.status(201).json({
      success: true,
      message: "Product added successfully",
      data: product,
    });
  } catch (error) {
    console.error("Add product failed:", error);
    if (req.files) {
      req.files.forEach((file) => {
        fs.unlink(path.join(__dirname, "../Uploads", file.filename), (err) => {
          if (err)
            console.error(`Failed to delete file ${file.filename}:`, err);
        });
      });
    }
    res.status(500).json({
      success: false,
      message: `Failed to add product: ${error.message}`,
      data: null,
    });
  }
};

// Update product
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const productdata = { ...req.body };
    let imageUrls = [];

    // Fetch current product
    const currentProduct = await Product.findById(id);
    if (!currentProduct) {
      if (req.files) {
        req.files.forEach((file) => {
          fs.unlink(
            path.join(__dirname, "../Uploads", file.filename),
            (err) => {
              if (err)
                console.error(`Failed to delete file ${file.filename}:`, err);
            }
          );
        });
      }
      return res.status(404).json({ message: "Product not found" });
    }

    // Validate input
    if (
      !productdata.name ||
      !productdata.categories ||
      !productdata.brand ||
      !productdata.description ||
      !productdata.price ||
      productdata.price <= 0
    ) {
      if (req.files) {
        req.files.forEach((file) => {
          fs.unlink(
            path.join(__dirname, "../Uploads", file.filename),
            (err) => {
              if (err)
                console.error(`Failed to delete file ${file.filename}:`, err);
            }
          );
        });
      }
      return res.status(400).json({
        message:
          "Missing required fields: name, categories, brand, description, or valid price",
      });
    }

    // Preserve existing images
    imageUrls = [...(currentProduct.images || [])];

    // Handle new uploaded images
    if (req.files && req.files.length > 0) {
      const newImageUrls = req.files.map(
        (file) => `${BASE_URL}/Uploads/${file.filename}`
      );
      imageUrls = [...imageUrls, ...newImageUrls];
      console.log("New image URLs:", newImageUrls);
    }

    // Handle existing images from frontend
    if (req.body.existingImages) {
      const existingImages = Array.isArray(req.body.existingImages)
        ? req.body.existingImages
        : req.body.existingImages
            .split(",")
            .map((url) => url.trim())
            .filter((url) => url && url.startsWith(`${BASE_URL}/Uploads`));
      imageUrls = [
        ...existingImages,
        ...imageUrls.filter((url) => !existingImages.includes(url)),
      ];
      console.log("Preserved existing images:", existingImages);
    }

    if (imageUrls.length === 0) {
      if (req.files) {
        req.files.forEach((file) => {
          fs.unlink(
            path.join(__dirname, "../Uploads", file.filename),
            (err) => {
              if (err)
                console.error(`Failed to delete file ${file.filename}:`, err);
            }
          );
        });
      }
      return res
        .status(400)
        .json({ message: "At least one image is required" });
    }

    if (imageUrls.length > 5) {
      if (req.files) {
        req.files.forEach((file) => {
          fs.unlink(
            path.join(__dirname, "../Uploads", file.filename),
            (err) => {
              if (err)
                console.error(`Failed to delete file ${file.filename}:`, err);
            }
          );
        });
      }
      return res.status(400).json({ message: "Maximum 5 images allowed" });
    }

    productdata.images = imageUrls;
    delete productdata.existingImages;

    const product = await Product.findByIdAndUpdate(id, productdata, {
      new: true,
      runValidators: true,
    });

    if (!product) {
      if (req.files) {
        req.files.forEach((file) => {
          fs.unlink(
            path.join(__dirname, "../Uploads", file.filename),
            (err) => {
              if (err)
                console.error(`Failed to delete file ${file.filename}:`, err);
            }
          );
        });
      }
      return res.status(404).json({
        success: false,
        message: "Product not found",
        data: null,
      });
    }

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: product,
    });
  } catch (error) {
    console.error("Update product failed:", error);
    if (req.files) {
      req.files.forEach((file) => {
        fs.unlink(path.join(__dirname, "../Uploads", file.filename), (err) => {
          if (err)
            console.error(`Failed to delete file ${file.filename}:`, err);
        });
      });
    }
    res.status(500).json({
      success: false,
      message: `Failed to update product: ${error.message}`,
      data: null,
    });
  }
};

// Delete product
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findByIdAndDelete(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
        data: null,
      });
    }

    // Delete associated image files
    if (product.images && product.images.length > 0) {
      product.images.forEach((imageUrl) => {
        const filename = path.basename(imageUrl);
        const filePath = path.join(__dirname, "../Uploads", filename);
        fs.unlink(filePath, (err) => {
          if (err) console.error(`Failed to delete image ${filename}:`, err);
        });
      });
    }

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
      data: null,
    });
  } catch (error) {
    console.error("Delete product failed:", error);
    res.status(500).json({
      success: false,
      message: `Failed to delete product: ${error.message}`,
      data: null,
    });
  }
};
