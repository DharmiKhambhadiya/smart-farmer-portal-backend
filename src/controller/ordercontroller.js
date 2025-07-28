const Order = require("../model/order");
const Cart = require("../model/cart");

// Create Order from Cart
exports.CreateOrder = async (req, res) => {
  try {
    const userId = req.user.userid;
    const { shippingdetails, shippingcharges, total } = req.body;

    if (!shippingdetails || !shippingcharges || !total) {
      return res.status(400).json({ message: "All fields are required" });
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
    console.log(req.orderitems);
    console.log(req.user);
    const newOrder = await Order.create({
      user: userId,
      shippingdetails,
      shippingcharges,
      subtotal: cart.subtotal || 0,
      total,
      orderitems,
    });

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

//  Get All Orders for Logged-in User
exports.getOrder = async (req, res) => {
  try {
    const userId = req.user.userid;

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

//  Optional Admin Feature Get All Orders (for dashboard)
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    console.error("Error fetching all orders:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

//  Optional Update Order Status (admin panel)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

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
