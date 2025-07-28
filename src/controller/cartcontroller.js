const Cart = require("../model/cart");
const Product = require("../model/product");

// Add or Increase Quantity of Cart Item
exports.addOrUpdateCartItems = async (req, res) => {
  try {
    const userId = req.user.userid;
    const { productId, quantity } = req.body;

    if (!productId || !quantity || quantity < 1) {
      return res
        .status(400)
        .json({ message: "Product ID and valid quantity required" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
      // Create new cart
      cart = new Cart({
        user: userId,
        items: [
          {
            product: product._id,
            name: product.name,
            price: product.price,
            image: product.mainImage,
            quantity,
            totalPrice: product.price * quantity,
          },
        ],
        subtotal: product.price * quantity,
      });
    } else {
      const itemIndex = cart.items.findIndex(
        (item) => item.product.toString() === productId
      );

      if (itemIndex > -1) {
        // Item exists → increase quantity
        cart.items[itemIndex].quantity += quantity;
        cart.items[itemIndex].totalPrice =
          cart.items[itemIndex].quantity * cart.items[itemIndex].price;
      } else {
        // New item
        cart.items.push({
          product: product._id,
          name: product.name,
          price: product.price,
          image: product.mainImage,
          quantity,
          totalPrice: quantity * product.price,
        });
      }

      // Recalculate subtotal
      cart.subtotal = cart.items.reduce(
        (sum, item) => sum + item.totalPrice,
        0
      );
    }

    await cart.save();
    return res
      .status(200)
      .json({ success: true, message: "Cart updated", data: cart });
  } catch (err) {
    console.error("Cart update failed:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Decrease or Set Quantity of a Cart Item
exports.updateItemQuantity = async (req, res) => {
  try {
    const userId = req.user.userid;
    const { productId, quantity } = req.body;

    if (!productId || typeof quantity !== "number" || quantity < 1) {
      return res
        .status(400)
        .json({ message: "Product ID and valid quantity required" });
    }

    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (itemIndex === -1) {
      return res.status(404).json({ message: "Item not found in cart" });
    }

    // Update quantity and totalPrice
    cart.items[itemIndex].quantity = quantity;
    cart.items[itemIndex].totalPrice = cart.items[itemIndex].price * quantity;

    // Recalculate subtotal
    cart.subtotal = cart.items.reduce((sum, item) => sum + item.totalPrice, 0);

    await cart.save();
    res
      .status(200)
      .json({ success: true, message: "Quantity updated", data: cart });
  } catch (err) {
    console.error("Update quantity failed:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get Cart
exports.getCart = async (req, res) => {
  try {
    const userId = req.user.userid;
    const cart = await Cart.findOne({ user: userId });

    if (!cart) {
      return res.status(404).json({ message: "No cart found" });
    }

    res.status(200).json({ success: true, data: cart });
  } catch (err) {
    console.error("Failed to fetch cart:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};
