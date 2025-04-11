const express = require("express");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");
const morgan = require("morgan");

// Connect to Database
connectDB();

const app = express();

// Middleware
app.use(morgan("dev"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use("/uploads", express.static(path.join(__dirname, "uploads")));
// app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(cors());

// Routes
const policyroute = require("./routes/policy");
const faqroute = require("./routes/faq");
const termsCondition = require("./routes/termscondition");
const studentBanner = require("./routes/StudentBanner/studentbanner");
const blogs = require("./routes/BlogsNewsletter/blog")
const newsletters = require("./routes/BlogsNewsletter/newsletter");
const ticket = require("./routes/Ticket/ticket");
const coupon = require("./routes/Coupon/coupon")
const notification  = require("./routes/Notification/notification")

// routes url
app.use("/api/policy", policyroute);
app.use("/api/faq", faqroute);
app.use("/api/terms", termsCondition);
app.use("/api/studentbanner", studentBanner);
app.use("/api/blogs", blogs);
app.use("/api/newsletter",newsletters);
app.use("/api/ticket",ticket);
app.use("/api/coupon",coupon);
app.use("/api/notification",notification)

module.exports = app;
