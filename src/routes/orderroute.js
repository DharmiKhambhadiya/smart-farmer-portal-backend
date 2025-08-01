const express = require("express");
const router = express.Router();
const orderController = require("../controller/ordercontroller");
const { verifyToken } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

//  Create Order from Cart (User)
router.post(
  "/create",
  verifyToken,
  authorizeRoles("user"),
  orderController.CreateOrder
);

//  Get Orders of Logged-in User
router.get(
  "/myorders",
  verifyToken,
  authorizeRoles("user"),
  orderController.getOrder
);

// Admin: Get All Orders
router.get(
  "/all",
  verifyToken,
  authorizeRoles("admin"),
  orderController.getAllOrders
);

//  Admin: Update Order Status
router.put(
  "/status/:id",
  verifyToken,
  authorizeRoles("admin"),
  orderController.updateOrderStatus
);

module.exports = router;
