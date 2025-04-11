const testModel = require("../../models/Test/newTest");
const XLSX = require("xlsx");
const axios = require("axios");
const mongoose = require('mongoose');

exports.createTest = async (req, res) => {
  try {
    const { testName, testPattern, sections } = req.body;

    const newTest = new testModel({
      testName,
      testPattern: testPattern,
      sections: Array.isArray(sections) ? sections : [],
    });

    const savedTest = await newTest.save();
    res.status(201).json({
      success: true,
      message: "Test created successfully",
      data: savedTest,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};