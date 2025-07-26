const express = require("express");
const router = express.Router();
const orderController = require("../controller/ordercontroller");
const { verifyToken } = require("../middleware/authMiddleware");

// Create Order from Cart (requires login)
router.post("/create", verifyToken, orderController.CreateOrder);

// Get All Orders of Logged-in User
router.get("/myorders", verifyToken, orderController.getOrder);

//  Admin Get All Orders
router.get("/all", orderController.getAllOrders);

//  Admin Update Order Status
router.put("/status/:id", orderController.updateOrderStatus);

module.exports = router;
