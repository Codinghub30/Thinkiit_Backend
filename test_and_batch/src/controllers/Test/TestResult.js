const TestResult = require("../../models/Test/TestResult");
const Test = require("../../models/Test/newTest");

// Save Test Result
const saveTestResult = async (req, res) => {
  try {
    const { testId, studentId, responses, timeTaken } = req.body;

    const test = await Test.findById(testId);
    if (!test) {
      return res.status(404).json({ message: "Test not found" });
    }

    let totalScore = 0;
    let totalNegativeMarks = 0;
    let sectionResults = [];

    test.sections.forEach((section) => {
      let sectionScore = 0;
      let sectionNegativeMarks = 0;
      let questionResponses = [];

      section.questionBankQuestionId.forEach((questionId) => {
        const studentResponse = responses.find(
          (r) => r.questionId === questionId
        );
        const correctAnswer = "CORRECT_ANSWER_FROM_DB"; // Fetch from Question Bank

        let isCorrect = studentResponse.studentAnswer === correctAnswer;
        let marksAwarded = isCorrect ? section.marksPerQuestion : 0;
        let negativeMarks = isCorrect ? 0 : section.negativeMarksPerWrongAnswer;

        sectionScore += marksAwarded;
        sectionNegativeMarks += negativeMarks;

        questionResponses.push({
          questionId,
          studentAnswer: studentResponse.studentAnswer,
          correctAnswer,
          isCorrect,
          marksAwarded,
          negativeMarks,
          timeTaken: studentResponse.timeTaken,
        });
      });

      totalScore += sectionScore;
      totalNegativeMarks += sectionNegativeMarks;

      sectionResults.push({
        subject: section.subject,
        subjectId: section.subjectId,
        questionResponses,
        totalMarks: sectionScore,
        totalNegativeMarks: sectionNegativeMarks,
      });
    });

    const finalScore = totalScore - totalNegativeMarks;

    const testResult = new TestResult({
      testId,
      studentId,
      sections: sectionResults,
      totalScore,
      totalNegativeMarks,
      finalScore,
      timeTaken,
    });

    await testResult.save();
    await calculateRanks(testId);

    res
      .status(201)
      .json({ message: "Test result saved successfully", testResult });
  } catch (error) {
    res.status(500).json({ message: "Error saving test result", error });
  }
};

// Calculate Ranks
const calculateRanks = async (testId) => {
  try {
    const results = await TestResult.find({ testId }).sort({
      finalScore: -1,
      timeTaken: 1,
    });

    for (let i = 0; i < results.length; i++) {
      results[i].rank = i + 1;
      await results[i].save();
    }

    return results;
  } catch (error) {
    console.error("Error calculating ranks:", error);
  }
};

// Fetch Test Results
const getTestResults = async (req, res) => {
  try {
    const { testId } = req.params;
    const results = await TestResult.find({ testId })
      .sort({ rank: 1 })
      .populate("studentId");

    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ message: "Error fetching results", error });
  }
};

module.exports = { saveTestResult, getTestResults };
