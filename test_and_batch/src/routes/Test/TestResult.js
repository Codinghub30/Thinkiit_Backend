const express = require("express");
const {
  saveTestResult,
  getTestResults,
} = require("../../controllers/Test/TestResult");

const router = express.Router();

router.post("/submit", saveTestResult);
router.get("/results/:testId", getTestResults);

module.exports = router;
