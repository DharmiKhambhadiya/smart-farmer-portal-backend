const mongoose = require("mongoose");
const Order = require("../model/order");
const Cart = require("../model/cart");
const User = require("../model/user");

// Create Order from Cart
exports.CreateOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    let { shippingdetails, shippingcharges, total } = req.body;

    if (shippingcharges == null || total == null) {
      return res
        .status(400)
        .json({ message: "Shipping charges and total are required" });
    }

    // 🔹 Auto-fill shipping details from user profile if not provided
    if (!shippingdetails || Object.keys(shippingdetails).length === 0) {
      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ message: "User not found" });

      shippingdetails = {
        firstName: user.firstName,
        lastName: user.lastName,
        city: user.city,
        phoneNumber: user.phoneNumber,
        address: user.address,
      };
    }

    const cart = await Cart.findOne({ user: userId });
    if (!cart || cart.items.length === 0) {
      return res.status(404).json({ message: "Your cart is empty" });
    }

    const orderitems = cart.items.map((item) => ({
      product: item.product,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      image: item.image,
    }));

    const newOrder = await Order.create({
      user: userId,
      shippingdetails,
      shippingcharges,
      subtotal: cart.subtotal || 0,
      total,
      orderitems,
    });

    // Empty the cart after order
    await Cart.findOneAndDelete({ user: userId });

    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      orderId: newOrder._id,
      data: newOrder,
    });
  } catch (error) {
    console.error("Error while placing order:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Get All Orders for Logged-in User
exports.getOrder = async (req, res) => {
  try {
    const userId = req.user.id;

    const orders = await Order.find({ user: userId }).sort({ createdAt: -1 });

    if (!orders || orders.length === 0) {
      return res.status(404).json({ message: "No orders found" });
    }

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Admin Feature Get All Orders (for dashboard) - Updated to populate user
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "firstName lastName email") // Populate basic user info
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    console.error("Error fetching all orders:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Optional Update Order Status (admin panel)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["processing", "shipped", "delivered"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).populate("user", "firstName lastName email");

    if (!updatedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    res
      .status(200)
      .json({ success: true, message: "Status updated", data: updatedOrder });
  } catch (error) {
    console.error("Error updating status:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Admin Feature: Get Latest Orders for Dashboard - FIXED (Backend only)
exports.getLatestOrders = async (req, res) => {
  try {
    const { limit = 5, page = 1 } = req.query; // Optional: limit and pagination

    // Calculate skip for pagination
    const skip = (Number(page) - 1) * Number(limit);

    // Get latest orders with user info and status
    const latestOrders = await Order.find()
      .populate("user", "firstName lastName email") // Populate basic user info
      .select(
        "orderitems status total shippingcharges createdAt user shippingdetails"
      ) // Select relevant fields
      .sort({ createdAt: -1 }) // Most recent first
      .skip(skip)
      .limit(Number(limit));

    // Get total count for pagination
    const totalOrders = await Order.countDocuments();

    // Format order items for display (show first item name and quantity)
    const formattedOrders = latestOrders.map((order) => ({
      _id: order._id,
      user: order.user,
      status: order.status,
      total: order.total,
      shippingcharges: order.shippingcharges,
      createdAt: order.createdAt,
      orderItemsPreview: order.orderitems
        .slice(0, 2)
        .map((item) => `${item.name} (x${item.quantity})`)
        .join(", "),
      totalItems: order.orderitems.length,
      formattedDate: new Date(order.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
    }));

    res.status(200).json({
      success: true,
      count: latestOrders.length,
      totalOrders,
      currentPage: Number(page),
      totalPages: Math.ceil(totalOrders / limit),
      data: formattedOrders,
    });
  } catch (error) {
    console.error("Error fetching latest orders:", error);
    res.status(500).json({ message: "Server Error" });
  }
};
