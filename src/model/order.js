const mongoose = require("mongoose");
const User = require("./user");

const orderschema = mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    shippingdetails: {
      firstName: { type: String },
      lastName: { type: String },
      city: { type: String },
      phoneNumber: { type: String },
      address: {
        street: { type: String },
        state: { type: String },
        pincode: { type: String },
      },
    },
    subtotal: { type: Number, required: true },
    shippingcharges: { type: Number, required: true },
    total: { type: Number, required: true },
    status: {
      type: String,
      enum: ["processing", "shipped", "delivered"],
      default: "processing",
    },

    orderitems: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        name: String,
        price: Number,
        quantity: { type: Number, default: 1 },
        image: String,
      },
    ],
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", orderschema);
module.exports = Order;
