const express = require("express");
const router = express.Router();
const auth = require("../controller/authcontroller");
const { verifyToken } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");
const validateRegister = require("../middleware/validateRegister");

router.post("/register", validateRegister, auth.register);
router.post("/verify-otp", auth.verifyOTP);
router.post("/resend-otp", auth.resendOTP);
router.post("/login", auth.login);
router.get("/profile", verifyToken, auth.getProfile);
router.post("/changepass", verifyToken, auth.changePassword);
router.post("/resetlink", auth.sendResetPasswordLink);
router.post("/resetpassword/:token", auth.resetPassword);

//Admin Routes
router.get(
  "/admin/users",
  verifyToken,
  authorizeRoles("admin"),
  auth.getAllUsers
);
router.get(
  "/admin/user/:id",
  verifyToken,
  authorizeRoles("admin"),
  auth.getUserById
);
router.put(
  "/admin/user/:id",
  verifyToken,
  authorizeRoles("admin"),
  auth.updateUserByAdmin
);
router.delete(
  "/admin/user/:id",
  verifyToken,
  authorizeRoles("admin"),
  auth.deleteUserByAdmin
);

module.exports = router;
