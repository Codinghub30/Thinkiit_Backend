const mongoose = require("mongoose");

const testSchema = new mongoose.Schema({
  test_id: { type: String },
  testName: { type: String },
  startDate: { type: String, index: true },
  startTime: { type: String },
  endTime: { type: String },
  enddate: { type: String },
  resultDate: { type: String },
  resultTime: { type: String },
  isLifetime: { type: Boolean, default: false },
});

const batchSchema = new mongoose.Schema({
  batch_name: { type: String, required: true },
  batch_year: { type: String },
  startDate: { type: String, required: true, index: true },
  endDate: { type: String, required: true, index: true },
  banner_img_path: { type: String },
  class: { type: String, required: true },
  category: { type: String, required: true },
  price: { type: Number, required: true },
  show: { type: Boolean, default: false },
  teachers: [
    {
      teacher_id: { type: mongoose.Schema.Types.ObjectId, ref: "Teacher" },
      name: { type: String },
      subjects: { type: [String] },
    },
  ],
  description: { type: String },
  createdBy: { type: String, default: "CT" },
  status: { type: String, default: "inactive", index: true },
  videos: { type: Boolean, default: false },
  assignments: { type: Boolean, default: false },
  ebooks: { type: Boolean, default: false },
  instituteId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Institute",
    index: true,
  },
  tests: [testSchema],
});

const Batch = mongoose.model("Batch", batchSchema);
module.exports = Batch;
