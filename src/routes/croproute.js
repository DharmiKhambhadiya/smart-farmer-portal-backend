const express = require("express");
const croptcontroller = require("../controller/cropcontroller");
const router = express.Router();

//user api
//get search crop
router.get("/search", croptcontroller.searchCrop);

//To Get all Crops
router.get("/", croptcontroller.getCrops);

//get all categories
router.get("/category", croptcontroller.getCategory);

//get latest crop
router.get("/latest", croptcontroller.getLatestCrop);

//To Get Crop By id
router.get("/:id", croptcontroller.getCrop);

module.exports = router;
