const express = require("express");
const router = express.Router();
const cropController = require("../controller/cropcontroller");
const { verifyToken } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");
const upload = require("../middleware/mmulter");

// USER ROUTES
router.get("/search", cropController.searchCrop);
router.get("/", cropController.getCrops);
router.get("/getlist", cropController.GetList);
router.get("/category", cropController.getCategory);
router.get("/latest", cropController.getLatestCrop);
router.get("/:id", cropController.getCrop);

//ADMIN-ONLY ROUTES

router.post(
  "/",
  verifyToken,
  authorizeRoles("admin"),
  upload.array("images", 5), // allow up to 5 images
  cropController.createCrop
);
router.put(
  "/:id",
  verifyToken,
  authorizeRoles("admin"),
  upload.array("images", 5), // allow up to 5 images
  cropController.updateCrop
);
router.delete(
  "/:id",
  verifyToken,
  authorizeRoles("admin"),
  cropController.deleteCrop
);

module.exports = router;
