const mongoose = require("mongoose");

const testResultSchema = new mongoose.Schema(
  {
    testId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "newTest",
      required: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    instituteId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Institute",
    },
    sections: [
      {
        subject: String,
        subjectId: String,
        questionResponses: [
          {
            questionId: String,
            studentAnswer: String,
            correctAnswer: String,
            isCorrect: Boolean,
            marksAwarded: Number,
            negativeMarks: Number,
            timeTaken: Number,
          },
        ],
        totalMarks: Number,
        totalNegativeMarks: Number,
      },
    ],
    totalScore: Number,
    totalNegativeMarks: Number,
    finalScore: Number,
    timeTaken: Number,
    rank: Number,
  },
  { timestamps: true }
);

const TestResult = mongoose.model("TestResult", testResultSchema);
module.exports = TestResult;
