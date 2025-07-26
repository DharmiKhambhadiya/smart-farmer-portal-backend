const Cart = require("../model/cart");

const Product = require("../model/product");

exports.AddorUpdateCartItems = async (req, res) => {
  try {
    const userid = req.user._id;
    const { productId, quantity } = req.body;
    if (!productId || !quantity) {
      return res
        .status(400)
        .json({ message: "Product ID and quantity are required" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    let cart = await Cart.findOne({ user: userid });

    if (!cart) {
      // Create a new cart
      cart = await Cart.create({
        user: userid,
        items: [
          {
            product: product._id,
            name: product.name,
            price: product.price,
            image: product.mainImage,
            quantity,
          },
        ],
        subtotal: product.price * quantity,
      });

      return res.status(201).json({ message: "Cart created", data: cart });
    } else {
      // Update existing cart
      const existingItemIndex = cart.items.findIndex(
        (item) => item.product.toString() === productId
      );

      if (existingItemIndex > -1) {
        // Update quantity
        cart.items[existingItemIndex].quantity += quantity;
      } else {
        // Add new item
        cart.items.push({
          product: product._id,
          name: product.name,
          price: product.price,
          image: product.mainImage,
          quantity,
        });
      }

      // Recalculate subtotal
      cart.subtotal = cart.items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );

      await cart.save();
      return res.status(200).json({ message: "Cart updated", data: cart });
    }
  } catch (error) {
    console.log("Failed to update cart:", error);
    res.status(500).json({ message: "Server error" });
  }
};

//get All order

exports.getOrder = async (req, res) => {
  try {
    const userid = req.user._id;
    const cart = await Cart.findOne({ user: userid });
    if (!cart) return res.status(404).json({ message: "No Cart Found" });

    res.status(200).json({ success: true, data: cart });
  } catch (error) {
    console.log("Failed To Get Cart items", error);
    res.status(500).json({ message: "server error" });
  }
};
