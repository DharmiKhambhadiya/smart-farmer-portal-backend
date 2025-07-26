const Product = require("../model/product");

//get all products
exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find();
    if (!products)
      return res.status(404).json({ message: "product not found" });

    res.status(200).json({ success: true, data: products });
  } catch (error) {
    console.log("failed to get products", error);
    res.status(500).json({ message: "server error" });
  }
};

//get product by id
exports.getProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ message: "product not found" });

    res.status(200).json({ success: true, data: product });
  } catch (error) {
    console.log("failed to get product", error);
    res.status(500).json({ message: "server error" });
  }
};

//get top 10 product
exports.getLatestproduct = async (req, res) => {
  try {
    const products = await Product.find({}).sort({ createdAt: -1 }).limit(10);
    return res.status(200).json({ success: true, data: products });
  } catch (error) {
    console.log("failed to get 10 products", error);
    res.status(500).json({ message: "server error " });
  }
};

//get categroies
exports.getAllCategroies = async (req, res) => {
  try {
    const categroies = await Product.distinct("categories");
    return res.status(200).json({ success: true, data: categroies });
  } catch (error) {
    console.log("failed to get categroies", error);
    res.status(500).json({ message: "server error " });
  }
};

//get filteres products
exports.searchProducts = async (req, res) => {
  try {
    const { search } = req.query;
    const basequery = {};

    //  Search by name, brand, or categories
    if (search) {
      basequery.$or = [
        { name: { $regex: search, $options: "i" } },
        { brand: { $regex: search, $options: "i" } },
        { categories: { $regex: search, $options: "i" } },
      ];
    }

    // Pagination params
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Get paginated data
    const products = await Product.find(basequery).skip(skip).limit(limit);

    //  Get total count for pagination
    const totalProducts = await Product.countDocuments(basequery);

    if (!products.length) {
      return res.status(404).json({ message: "No products found" });
    }

    //  Send response with pagination info
    res.status(200).json({
      success: true,
      page,
      limit,
      totalProducts,
      totalPages: Math.ceil(totalProducts / limit),
      data: products,
    });
  } catch (error) {
    console.error(" Failed to get products", error);
    res.status(500).json({ message: "Server error" });
  }
};
