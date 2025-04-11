const mongoose = require("mongoose");

const questionTypeSchema = new mongoose.Schema({
  questionType: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  title: {
    type: String,
    required: true,
  },
});

const QuestionType = mongoose.model("QuestionType", questionTypeSchema);
module.exports = QuestionType;
