const express = require("express");
const dashboardcontroller = require("../controller/dashboardcontroller");
const { verifyToken } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");
const router = express.Router();

router.get(
  "/get",
  verifyToken,
  authorizeRoles("admin"),
  dashboardcontroller.GetWeeklyReport
);

module.exports = router;
