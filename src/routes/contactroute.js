const express = require("express");
const contactcontroller = require("../controller/contactcontroller");
const contact = require("../model/contact");
const router = express.Router();

//create message
router.post("/create", contactcontroller.createMess);

//Get All Request
router.get("/getAllrequest", contactcontroller.getAllRequest);

//Get Request by Id
router.get("/getRequestById", contactcontroller.getRequest);
module.exports = router;
