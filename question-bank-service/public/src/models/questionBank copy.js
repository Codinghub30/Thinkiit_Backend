const mongoose = require("mongoose");

const QuestionSchema = new mongoose.Schema({
  QID: { type: String, required: true, unique: true },
  Class: { type: Number, required: true },
  Subject: { type: String, required: true },
  Type: {
    type: String,
    required: true,
    enum: [
      "SCQ",
      "MCQ",
      "NTQ",
      "Integer",
      "Assertion",
      "Compression",
      "Numerical",
    ],
  },
  Chapter: { type: String },
  Topic: { type: String },
  Difficulty: { type: String },
  AppearedIn: { type: String },

  // Multilingual Questions
  Question: {
    English: { type: String },
    Hindi: { type: String },
    Gujarati: { type: String },
  },

  // Multilingual Options (with text and image fields)
  Options: {
    English: [
      {
        text: { type: String },
        image: { type: String },
      },
    ],
    Hindi: [
      {
        text: { type: String },
        image: { type: String },
      },
    ],
    Gujarati: [
      {
        text: { type: String },
        image: { type: String },
      },
    ],
  },

  Answer: { type: String },
  SolutionSteps: { type: String },
  SolutionVideo: { type: String },
  Images: [{ type: String }],
  CreatedAt: { type: Date, default: Date.now },
});

const Question = mongoose.model("Question", QuestionSchema);

module.exports = Question;
