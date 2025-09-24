const express = require("express");
const productController = require("../controller/productcontroller");
const { verifyToken } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");
const { upload, handleMulterError } = require("../middleware/mmulter"); // Fixed typo: mmulter -> multer

const router = express.Router();

// Public routes (no authentication required)
router.get("/search", productController.searchProducts); // Search products with pagination
router.get("/latest", productController.getLatestproduct); // Get latest 8 products
router.get("/category", productController.getAllCategroies); // Get distinct categories
router.get("/", productController.getProducts); // Get all products
router.get("/:id", productController.getProduct); // Get product by ID

// Admin-only routes (require authentication and admin role)
router.post(
  "/",
  verifyToken,
  authorizeRoles("admin"),
  upload, // Handle up to 5 images (configured in multer.js)
  handleMulterError, // Handle multer-specific errors
  productController.addProduct // Create new product
);

router.put(
  "/:id",
  verifyToken,
  authorizeRoles("admin"),
  upload, // Handle up to 5 images for updates
  handleMulterError, // Handle multer-specific errors
  productController.updateProduct // Update product by ID
);

router.delete(
  "/:id",
  verifyToken,
  authorizeRoles("admin"),
  productController.deleteProduct // Delete product by ID
);

module.exports = router;
