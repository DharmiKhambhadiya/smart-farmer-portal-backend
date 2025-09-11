const express = require("express");
const productController = require("../controller/productcontroller");
const { verifyToken } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");
const upload = require("../middleware/mmulter");

const router = express.Router();

// Public routes
router.get("/search", productController.searchProducts);
router.get("/latest", productController.getLatestproduct);
router.get("/category", productController.getAllCategroies);
router.get("/", productController.getProducts);
router.get("/:id", productController.getProduct);

// Admin-only routes
router.post(
  "/",
  verifyToken,
  authorizeRoles("admin"),
  upload.array("images", 5), // allow up to 5 images
  productController.addProduct
);

router.put(
  "/:id",
  verifyToken,
  authorizeRoles("admin"),
  upload.array("images", 5), // update with new images if needed
  productController.updateProduct
);

router.delete(
  "/:id",
  verifyToken,
  authorizeRoles("admin"),
  productController.deleteProduct
);

module.exports = router;
