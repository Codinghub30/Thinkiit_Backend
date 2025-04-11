const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const studentRoutes = require("./routes/student");
const batchPurchase = require("./routes/batchPurchase")

const connectDB = require("./config/db");
require("dotenv").config();
connectDB();
const app = express();

// Middleware
app.use(express.json());
app.use(morgan("dev"));
app.use(cors());

// Routes
app.use("/api/auth", studentRoutes);
app.use("/api/batchpurchase",batchPurchase)

module.exports = app;
