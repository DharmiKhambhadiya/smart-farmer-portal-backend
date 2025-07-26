const express = require("express");
const productcontroller = require("../controller/productcontroller");
const router = express.Router();

//get search product
router.get("/search", productcontroller.searchProducts);

//get latest product
router.get("/latest", productcontroller.getLatestproduct);

//get all categories
router.get("/category", productcontroller.getAllCategroies);

//get  All product
router.get("/", productcontroller.getProducts);

//get product by id
router.get("/:id", productcontroller.getProduct);

module.exports = router;
