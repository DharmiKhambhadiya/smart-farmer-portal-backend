const express = require("express");
const mongoose = require("mongoose");
const bodyparser = require("body-parser");
// const dotenv = require("dotenv");
const cors = require("cors");
const authRoutes = require("./src/routes/authroutes");
const croproute = require("./src/routes/croproute");
const productroute = require("./src/routes/productroute");
const orderroute = require("./src/routes/orderroute");
const cartroute = require("./src/routes/cartroute");
const contactroute = require("./src/routes/contactroute");

// dotenv.config();
require("dotenv").config();

const app = express();
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: false }));

//router
app.use("/api/auth", authRoutes);
app.use("/api/crop", croproute);
app.use("/api/product", productroute);
app.use("/api/order", orderroute);
app.use("/api/order", orderroute);
app.use("/api/cart", cartroute);
app.use("/api/contact", contactroute);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(process.env.PORT, () => {
      console.log(`Server running on port ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection failed:", err);
  });
