const express = require("express");
const router = express.Router();
const authcontroller = require("../controller/authcontroller");
const { verifyToken } = require("../middleware/authMiddleware");
const validateregister = require("../middleware/validateregister");

router.post("/register", validateregister, authcontroller.registerUser);
router.post("/verify-otp", authcontroller.verifyOTP);
router.post("/login", authcontroller.loginUser);
router.get("/profile", verifyToken, authcontroller.getProfile);
router.post("/changepass", verifyToken, authcontroller.changePassword);
router.post("/resetlink", authcontroller.sendResetPasswordLink);
router.post("/resetpassword/:token", authcontroller.ResetPassword);

module.exports = router;
