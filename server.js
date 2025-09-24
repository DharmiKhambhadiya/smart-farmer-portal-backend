const express = require("express");
const mongoose = require("mongoose");
const bodyparser = require("body-parser");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

require("dotenv").config();

const app = express();

// CORS configuration
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

// ✅ CRITICAL: Static files served BEFORE other middleware
const uploadsPath = path.join(__dirname, "Uploads"); // Correct path for your structure

// Check if Uploads folder exists and list contents
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
} else {
  fs.readdir(uploadsPath, (err, files) => {
    if (err) {
      console.error("❌ Cannot read Uploads folder:", err);
    } else {
      console.log("📁 Files in Uploads folder:", files);
    }
  });
}

// ✅ Serve static files at both /uploads and /Uploads for compatibility
app.use("/uploads", express.static(uploadsPath));
app.use("/Uploads", express.static(uploadsPath));

// Body parser (AFTER static files)
app.use(bodyparser.json({ limit: "50mb" }));
app.use(bodyparser.urlencoded({ extended: true, limit: "50mb" }));

// Routes
const authRoutes = require("./src/routes/authroutes");
const croproute = require("./src/routes/croproute");
const productroute = require("./src/routes/productroute");
const orderroute = require("./src/routes/orderroute");
const cartroute = require("./src/routes/cartroute");
const contactroute = require("./src/routes/contactroute");
const dashboardroute = require("./src/routes/dashboardroute");

app.use("/api/auth", authRoutes);
app.use("/api/crop", croproute);
app.use("/api/product", productroute);
app.use("/api/order", orderroute);
app.use("/api/cart", cartroute);
app.use("/api/contact", contactroute);
app.use("/api/dashboard", dashboardroute);

// MongoDB connection
const PORT = process.env.PORT || 5000;
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err);
  });
