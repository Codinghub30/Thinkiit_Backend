const mongoose = require("mongoose");

const assignmentSchema = new mongoose.Schema({
  className: {
    type: String,
  },
  subjectName: {
    type: String,
  },
  category: {
    type: String,
  },
  chapter: { type: String, required: true },
  topic: { type: String },
  marks: { type: Number, required: true },
  book_file_path: { type: String, required: true },
  created_at: { type: Date, default: Date.now },
});

const Assignment = mongoose.model("Assignment", assignmentSchema);

module.exports = Assignment;
