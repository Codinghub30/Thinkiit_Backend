const mongoose = require("mongoose");

const QuestionSchema = new mongoose.Schema(
  {
    QID: { type: String, required: true, unique: true },
    Class: { type: String, required: true, index: true },
    Subject: { type: String },
    Type: { type: String, required: true },
    Chapter: { type: String, required: true },
    Topic: { type: String, required: true },
    Difficulty: { type: String, required: true },
    AppearedIn: { type: String },
    English: { type: String, required: true },
    OptionsEnglish: { type: String },
    Hindi: { type: String },
    OptionsHindi: { type: String },
    Gujarati: { type: String },
    OptionsGujarati: { type: String },
    NoOfOptions: { type: Number },
    Options: { type: Array },
    Answer: { type: String },
    numericalanswer: { type: String },
    SolutionSteps: { type: String },
    KSolutionSteps: { type: String },
    SolutionVideo: { type: String },
    Images: { type: Object },
    Language: { type: String },
  },
  { timestamps: true }
);

QuestionSchema.index({
  Class: 1,
  Subject: 1,
  Type: 1,
  Chapter: 1,
  SubChapter: 1,
});

module.exports = mongoose.model("QuestionManagment", QuestionSchema);
