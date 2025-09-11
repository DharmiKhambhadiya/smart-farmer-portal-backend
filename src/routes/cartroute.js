const express = require("express");
const router = express.Router();
const cartController = require("../controller/cartcontroller");
const { verifyToken } = require("../middleware/authMiddleware");

router.post("/add", verifyToken, cartController.addOrUpdateCartItems);
router.put("/update-quantity", verifyToken, cartController.updateItemQuantity);
router.get("/mycart", verifyToken, cartController.getCart);
router.post("/mergecart", verifyToken, cartController.mergeCart);
router.delete("/:productId", verifyToken, cartController.removeFromCart);
module.exports = router;
