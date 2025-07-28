const express = require("express");
const router = express.Router();
const cropController = require("../controller/cropcontroller");
const { verifyToken } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

// USER ROUTES
router.get("/search", cropController.searchCrop);
router.get("/", cropController.getCrops);
router.get("/category", cropController.getCategory);
router.get("/latest", cropController.getLatestCrop);
router.get("/:id", cropController.getCrop);

//ADMIN-ONLY ROUTES

router.post(
  "/",
  verifyToken,
  authorizeRoles("admin"),
  cropController.createCrop
);
router.put(
  "/:id",
  verifyToken,
  authorizeRoles("admin"),
  cropController.updateCrop
);
router.delete(
  "/:id",
  verifyToken,
  authorizeRoles("admin"),
  cropController.deleteCrop
);

module.exports = router;
