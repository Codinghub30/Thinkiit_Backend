const mongoose = require("mongoose");

const testSchema = new mongoose.Schema(
  {
    testName: {
      type: String,
      unique: true,
    },
    class: {
      type: String,
    },

    noOfSections: {
      type: Number,
    },
    instituteId: {
      type: String,
    },

    testMode: {
      type: String,
    },
    testDuration: {
      type: String,
    },

    testPattern: {
      type: String,
    },

    sections: [
      {
        sectionName: {
          type: String,
        },

        subjects: [
          {
            subjectName: { type: String },
            subjectId: {
              type: String,
            },
            chapter: [
              {
                chapterName: { type: String },
                topic: [
                  {
                    topicName: {
                      type: String,
                    },
                    numberOfQuestions: {
                      type: Number,
                    },
                  },
                ],
              },
            ],
          },
        ],

        // topic: [
        //   {
        //     type: {
        //       topicName: {
        //         type: String,
        //       },
        //       numberOfQuestions: {
        //         type: Number,
        //       },

        //     },
        //   },
        // ],

        questionType: {
          type: String,
        },
        numberOfQuestions: {
          type: Number,
        },
        marksPerQuestion: {
          type: Number,
        },
        minQuestionsAnswerable: {
          type: Number,
        },
        negativeMarksPerWrongAnswer: {
          type: Number,
        },
        questionSelection: {
          type: String,
        },
        sectionStatus: {
          type: String,

          default: "incomplete",
        },
        questionBankQuestionId: {
          type: Array,
        },
      },
    ],
  },
  { timestamps: true }
);

const testModel = mongoose.model("newTest", testSchema);
module.exports = testModel;
