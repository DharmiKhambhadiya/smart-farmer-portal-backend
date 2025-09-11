const Cart = require("../model/cart");
const Product = require("../model/product");

// Add or Increase Quantity of Cart Item
exports.addOrUpdateCartItems = async (req, res) => {
  try {
    const userId = req.user.id; // Changed from req.user.userid
    const { productId, quantity } = req.body;

    console.log("🛒 Add to cart request:", { userId, productId, quantity }); // Debug

    if (!productId || !quantity || quantity < 1) {
      return res
        .status(400)
        .json({ message: "Product ID and valid quantity required" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      console.log("❌ Product not found:", productId);
      return res.status(404).json({ message: "Product not found" });
    }

    console.log("✅ Product found:", product.name, "Price:", product.price); // Debug

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
        console.log("➕ Increased quantity for existing item"); // Debug
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
        console.log("🆕 Added new item to cart"); // Debug
      }

      // Recalculate subtotal
      cart.subtotal = cart.items.reduce(
        (sum, item) => sum + item.totalPrice,
        0
      );
    }

    await cart.save();
    console.log("💾 Cart saved successfully. Total items:", cart.items.length); // Debug

    // Return only the items and subtotal (match your frontend expectation)
    return res.status(200).json({
      success: true,
      message: "Cart updated",
      data: {
        items: cart.items,
        subtotal: cart.subtotal,
      },
    });
  } catch (err) {
    console.error("❌ Cart update failed:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Update the other functions similarly to use req.user.id
exports.updateItemQuantity = async (req, res) => {
  try {
    const userId = req.user.id; // Changed from req.user.userid
    const { productId, quantity } = req.body;

    console.log("🔄 Update quantity request:", { userId, productId, quantity }); // Debug

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
    res.status(200).json({
      success: true,
      message: "Quantity updated",
      data: {
        items: cart.items,
        subtotal: cart.subtotal,
      },
    });
  } catch (err) {
    console.error("Update quantity failed:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get Cart
exports.getCart = async (req, res) => {
  try {
    const userId = req.user.id; // Changed from req.user.userid
    console.log("📦 Fetching cart for user:", userId); // Debug

    const cart = await Cart.findOne({ user: userId }).populate("items.product");

    if (!cart) {
      console.log("ℹ️ No cart found for user:", userId);
      return res.status(404).json({ message: "No cart found" });
    }

    console.log("✅ Cart fetched. Items count:", cart.items.length); // Debug
    res
      .status(200)
      .json({
        success: true,
        data: { items: cart.items, subtotal: cart.subtotal },
      });
  } catch (err) {
    console.error("Failed to fetch cart:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Remove From Cart
exports.removeFromCart = async (req, res) => {
  try {
    const userId = req.user.id; // Changed from req.user.userid
    const { productId } = req.params;

    console.log("🗑️ Remove item request:", { userId, productId }); // Debug

    const cart = await Cart.findOne({ user: userId });

    if (!cart) {
      return res
        .status(404)
        .json({ success: false, message: "Cart not found" });
    }

    const initialItemCount = cart.items.length;
    cart.items = cart.items.filter(
      (item) => item.product.toString() !== productId
    );

    if (cart.items.length === initialItemCount) {
      return res
        .status(404)
        .json({ success: false, message: "Item not found in cart" });
    }

    // Recalculate subtotal
    cart.subtotal = cart.items.reduce((sum, item) => sum + item.totalPrice, 0);

    await cart.save();

    console.log("✅ Item removed successfully"); // Debug
    res.json({
      success: true,
      message: "Item removed successfully",
      items: cart.items,
      subtotal: cart.subtotal,
    });
  } catch (error) {
    console.error("Remove from cart failed:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Merge cart (already good, just update userId)
exports.mergeCart = async (req, res) => {
  try {
    const userId = req.user.id; // Changed from req.user.userid
    const { items } = req.body;

    console.log("🔗 Merge cart request:", {
      userId,
      itemsCount: items?.length,
    }); // Debug

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "No items to merge" });
    }

    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      cart = new Cart({ user: userId, items: [], subtotal: 0 });
    }

    let mergedCount = 0;
    for (const { productId, quantity } of items) {
      if (!productId || !quantity || quantity < 1) continue;

      const product = await Product.findById(productId);
      if (!product) {
        console.log("⚠️ Product not found during merge:", productId);
        continue;
      }

      const itemIndex = cart.items.findIndex(
        (item) => item.product.toString() === productId
      );

      if (itemIndex > -1) {
        cart.items[itemIndex].quantity += quantity;
        cart.items[itemIndex].totalPrice =
          cart.items[itemIndex].quantity * cart.items[itemIndex].price;
      } else {
        cart.items.push({
          product: product._id,
          name: product.name,
          price: product.price,
          image: product.mainImage,
          quantity,
          totalPrice: quantity * product.price,
        });
      }
      mergedCount++;
    }

    cart.subtotal = cart.items.reduce((sum, item) => sum + item.totalPrice, 0);
    await cart.save();

    console.log(`✅ Merged ${mergedCount} items into cart`); // Debug
    return res.status(200).json({
      success: true,
      message: `Local cart merged successfully (${mergedCount} items)`,
      data: { items: cart.items, subtotal: cart.subtotal },
    });
  } catch (error) {
    console.error("Merge cart failed:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
