const express = require("express");
const router = express.Router();
const contactcontroller = require("../controller/contactcontroller");
const { verifyToken } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

// User creates message
router.post(
  "/create",
  verifyToken,
  authorizeRoles("user"),
  contactcontroller.createMess
);

// Admin gets all messages
router.get(
  "/getAllrequest",
  verifyToken,
  authorizeRoles("admin"),
  contactcontroller.getAllRequest
);

// Admin gets request by ID
router.get(
  "/getRequestById/:id",
  verifyToken,
  authorizeRoles("admin"),
  contactcontroller.getRequest
);

// Admin replies to request
router.put(
  "/reply/:id",
  verifyToken,
  authorizeRoles("admin"),
  contactcontroller.replyRequest
);

module.exports = router;
