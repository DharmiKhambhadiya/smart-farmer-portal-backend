const mongoose = require("mongoose");
const Product = require("./product");
const { User } = require("./user");

const cartItemSchema = mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: Product,
  },
  quntity: {
    type: Number,
    default: 1,
  },
  name: String,
  price: Number,
  image: String,
});

const cartSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: User,
    },
    items: [cartItemSchema],
    subtotal: {
      type: Number,
    },
  },
  { timestamps: true }
);

const Cart = mongoose.model("cart", cartSchema);
module.exports = Cart;
