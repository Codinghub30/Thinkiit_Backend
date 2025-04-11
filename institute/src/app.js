const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
require("dotenv").config();
const connectDB = require("./config/db");

connectDB();
const app = express();

// Middleware
app.use(express.json());
app.use(morgan("dev"));
app.use(cors());

const category = require("./routes/category/category");
const languages = require("./routes/language/languages");
const adminRoute = require("./routes/admin");
const teacherRoute = require("./routes/teacher");
const instituteRoute = require("./routes/institute");

// Routes
// app.use((req, res, next) => {
//     const subdomain = req.headers.host.split(".")[0];
//     req.subdomain = subdomain !== "kalpkosh" ? subdomain : null;
//     next();
//   });

app.use("/api/category", category);
app.use("/api/language", languages);
app.use("/api/admin", adminRoute);
app.use("/api/teacher", teacherRoute);
app.use("/api/institute", instituteRoute);

module.exports = app;
