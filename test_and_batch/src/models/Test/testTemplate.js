const mongoose = require("mongoose");

const testTemplateSchema = new mongoose.Schema(
  {
    templatename: {
      type: String,
      required: true,
    },
    tempDesc: {
      type: String,
    },
    duration: {
      type: String,
    },
    totalMarks: {
      type: String,
    },
    language: {
      type: String,
    },
    class: {
      type: String,
    },
    testType: {
      type: String,
    },
    timerOption: {
      type: Boolean,
    },
    timerEnable: {
      type: Boolean,
      default: false,
    },
    instituteId: { type: String, required: true, index: true },
  },
  { timestamps: true }
);

const testTemplateModel = mongoose.model("testTemplate", testTemplateSchema);
module.exports = testTemplateModel;
