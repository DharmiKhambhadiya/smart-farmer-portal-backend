const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    stock: { type: Number, required: true },
    subtitle: { type: String },
    categories: { type: String, required: true },
    brand: { type: String, required: true },
    description: { type: String, required: true },
    madeIn: { type: String },
    images: [{ type: String }],
    price: { type: Number, required: true },
    bestSeller: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", productSchema);
module.exports = Product;
