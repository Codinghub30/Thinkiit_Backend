const mongoose = require("mongoose");

const testSchema = new mongoose.Schema(
  {
    templateId: {
      type: String,
      required: true,
    },
    sections: [
      {
        sectionTitle: {
          type: String,
          required: true,
        },
        questionType: {
          type: String,
          required: true,
        },
        numberOfQuestions: {
          type: Number,
          required: true,
        },
        marksPerQuestion: {
          type: Number,
          required: true,
        },
        marksPerCorrectPart: {
          type: Number,
        },
        marksPerSection: {
          type: Number,
          required: true,
        },
        minQuestionsAnswerable: {
          type: Number,
        },
        negativeMarksPerWrongAnswer: {
          type: Number,
        },
        questionSelection: {
          type: String,
          required: true,
        },
        sectionStatus: {
          type: String,
          // enum: ["active", "inactive"],
          default: "incomplete",
        },
        questionBankQuestionId: {
          type: Object,
        },
      },
    ],
  },
  { timestamps: true }
);

const testModel = mongoose.model("Test", testSchema);
module.exports = testModel;
