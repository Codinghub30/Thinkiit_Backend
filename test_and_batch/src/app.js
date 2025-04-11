const express = require("express");
const cors = require("cors");

const testTemplate = require("./routes/Test/testTemplate");
const test = require("./routes/Test/test");
const testPackage = require("./routes/Test/testPackage");
const newTest = require("./routes/Test/newTest");

const batchRoutes = require("./routes/batch/batch");
const assignmentRoutes = require("./routes/batch/assignment");
const ebookRoutes = require("./routes/batch/ebook");
const videoRoutes = require("./routes/batch/video");
const testResultRoutes = require("./routes/Test/TestResult");

require("dotenv").config();

const app = express();
const morgan = require("morgan");
app.use(morgan("dev"));
const connectDB = require("./config/db");

connectDB();

// Middleware
app.use(express.json());
app.use(cors());

// Routes

app.use("/api/test", testTemplate);
app.use("/api/test/", test);
app.use("/api/newTest", newTest);
app.use("/api/testResult", testResultRoutes);
app.use("/api/testPackage/", testPackage);

//
app.use("/api/batches", batchRoutes);
app.use("/api/assignments", assignmentRoutes);
app.use("/api/ebooks", ebookRoutes);
app.use("/api/videos", videoRoutes);

module.exports = app;
