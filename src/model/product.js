const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    stock: { type: Number, required: true },
    categories: { type: String, required: true },
    brand: { type: String, required: true },
    description: { type: String, required: true },
    madeIn: { type: String },
    mainImage: { type: String, required: true },
    otherImages: [{ type: String }],
    price: { type: Number, required: true },
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model("Product", productSchema);
module.exports = Product;
