const express = require("express");

require("dotenv").config();

const app = express();
const connectDB = require("./config/db");
const cors = require("cors");

app.use(express.static("public"));

connectDB();

// Middleware
app.use(express.json());
app.use(cors());
// Routes
const questionsBank = require("./routes/questionBank");
const classRoute = require("./routes/class");
const subjectRoute = require("./routes/subject");
const chapterRoutes = require("./routes/chapter");
const topicRoutes = require("./routes/topic");
const questionTypeRoutes = require("./routes/questionType");

//class
app.use("/api/class", classRoute);
app.use("/api/subject", subjectRoute);
app.use("/api/chapter", chapterRoutes);
app.use("/api/topic", topicRoutes);
app.use("/api/QB", questionsBank);
app.use("/api/questionType", questionTypeRoutes);

module.exports = app;
