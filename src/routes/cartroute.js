const express = require("express");
const { verifyToken } = require("../middleware/authMiddleware");
const cartcontroller = require("../controller/cartcontroller");

const router = express.Router();

//create cart
router.post("/add", verifyToken, cartcontroller.AddorUpdateCartItems);

// get cart
router.get("/getorder", verifyToken, cartcontroller.getOrder);
module.exports = router;
