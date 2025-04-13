const testModel = require("../../models/Test/newTest");
const axios = require("axios");
const mongoose = require("mongoose");

const QUESTION_MICROSERVICE_URL = "http://localhost:8003/api/QB/getByIds";

const normalize = (str) => str.trim().toLowerCase();

exports.createTest = async (req, res) => {
  try {
    // const { testName, className, sections, testPattern, selectionType } =
    const { testName, className, sections, testPattern, selectionType } =
      req.body;
    const updatedSections = [];

    // for (const section of sections) {
    //   if (selectionType === "QID" && section.questionBankQuestionId?.length) {
    //     const { data } = await axios.post(
    //       "http://localhost:8003/api/QB/getchapterByIds",
    //       { qids: section.questionBankQuestionId }
    //     );

    //     const questions = data?.data || [];

    //     const chapterMap = new Map(); // normalizedChapter -> chapter object
    //     const topicMap = new Map(); // normalizedChapter_normalizedTopic -> topic object
    //     const chapterOriginalMap = new Map(); // normalizedChapter -> originalChapterName

    //     questions.forEach((q) => {
    //       const rawChapter = q.Chapter;
    //       const rawTopic = q.Topic;
    //       const normalizedChapter = normalize(rawChapter);
    //       const normalizedTopic = normalize(rawTopic);
    //       const topicKey = `${normalizedChapter}_${normalizedTopic}`;

    //       // Save original chapter casing for first occurrence
    //       if (rawChapter && !chapterOriginalMap.has(normalizedChapter)) {
    //         chapterOriginalMap.set(normalizedChapter, rawChapter);
    //       }

    //       // Chapter deduplication
    //       if (rawChapter && !chapterMap.has(normalizedChapter)) {
    //         chapterMap.set(normalizedChapter, {
    //           chapterId: chapterOriginalMap.get(normalizedChapter),
    //           chapterName: chapterOriginalMap.get(normalizedChapter),
    //         });
    //       }

    //       // Topic deduplication and count
    //       if (rawTopic && rawChapter) {
    //         if (topicMap.has(topicKey)) {
    //           topicMap.get(topicKey).numberOfQuestions += 1;
    //         } else {
    //           topicMap.set(topicKey, {
    //             topicName: rawTopic,
    //             numberOfQuestions: 1,
    //             chapterId: chapterOriginalMap.get(normalizedChapter),
    //           });
    //         }
    //       }
    //     });

    //     section.chapter = Array.from(chapterMap.values());
    //     section.topic = Array.from(topicMap.values());
    //   }

    //   updatedSections.push(section);
    // }

    const newTest = new testModel({
      testName,
      class: className,
      sections: updatedSections,
      testPattern,
      selectionType,
    });

    const savedTest = await newTest.save();

    res.status(201).json({
      success: true,
      message: "Test created successfully",
      data: savedTest,
    });
  } catch (error) {
    console.error("Test Creation Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createSection = async (req, res) => {
  try {
    const { testId } = req.params;

    const {
      sectionName,
      questionType,
      correctAnswerMarks,
      negativeMarks,
      questionBankQuestionId,
      chapter,
      topic,
      subject,
    } = req.body;

    const newSection = {
      sectionName: sectionName || "",
      questionType: questionType || "SCQ",
      correctAnswerMarks: correctAnswerMarks || 0,
      negativeMarks: negativeMarks || 0,
      questionBankQuestionId: questionBankQuestionId || [],
      chapter: chapter || [],
      topic: topic || [],
      subject: subject || [],
      sectionStatus: "incomplete",
    };

    const updateTest = await testModel.findByIdAndUpdate(
      testId,
      {
        $push: { sections: newSection },
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "Section added successfully",
      data: updateTest,
    });
  } catch (error) {
    console.error("Error adding section:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.deleteTest = async (req, res) => {
  try {
    const { testId } = req.body;

    const deletedTest = await testModel.findByIdAndDelete(testId);

    if (!deletedTest) {
      return res.status(404).json({
        success: false,
        message: "Test not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Test deleted successfully",
      data: deletedTest,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.addSectionToTest = async (req, res) => {
  try {
    const { testId } = req.params;
    const section = req.body;

    if (!section) {
      return res
        .status(400)
        .json({ success: false, message: "Section data is required" });
    }

    const updatedTest = await testModel.findByIdAndUpdate(
      testId,
      {
        $push: { sections: section },
        $inc: { noOfSections: 1 },
      },
      { new: true }
    );

    if (!updatedTest) {
      return res
        .status(404)
        .json({ success: false, message: "Test not found" });
    }

    res.status(201).json({
      success: true,
      message: "Section added successfully",
      data: updatedTest,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.editSection = async (req, res) => {
  try {
    const { testId, sectionId } = req.params;
    const updateData = req.body;

    const updatedTest = await testModel.findOneAndUpdate(
      { _id: testId, "sections._id": sectionId },
      { $set: { "sections.$": { ...updateData, _id: sectionId } } },
      { new: true }
    );

    if (!updatedTest) {
      return res
        .status(404)
        .json({ success: false, message: "Test or Section not found" });
    }

    res.status(200).json({
      success: true,
      message: "Section updated successfully",
      data: updatedTest,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteSection = async (req, res) => {
  try {
    const { testId, sectionId } = req.params;

    const test = await testModel.findById(testId);
    if (!test) {
      return res
        .status(404)
        .json({ success: false, message: "Test not found" });
    }

    // Check if section exists
    const sectionExists = test.sections.some(
      (section) => section._id.toString() === sectionId
    );
    if (!sectionExists) {
      return res
        .status(404)
        .json({ success: false, message: "Section not found in this test" });
    }

    // Remove the section and decrement the noOfSections count
    const updatedTest = await testModel.findByIdAndUpdate(
      testId,
      {
        $pull: { sections: { _id: sectionId } }, // Remove the section
        $inc: { noOfSections: -1 }, // Decrease noOfSections count
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "Section deleted successfully",
      data: updatedTest,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateSectionDetails = async (req, res) => {
  try {
    const { testId, sectionId } = req.params;
    const { topics, chapter, questionSelection } = req.body;

    // Find and update only the necessary fields
    const updatedTest = await testModel.findOneAndUpdate(
      { _id: testId, "sections._id": sectionId },
      {
        $set: {
          "sections.$.topic": topics || [],
          "sections.$.chapter": chapter || [],
          "sections.$.questionSelection": questionSelection || "",
        },
      },
      { new: true }
    );

    if (!updatedTest) {
      return res
        .status(404)
        .json({ success: false, message: "Test or Section not found" });
    }

    res.status(200).json({
      success: true,
      message: "Section details updated successfully",
      data: updatedTest,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.addQuestionsToSection = async (req, res) => {
  try {
    const { testId, sectionId } = req.params;
    const { questionBankQuestionId } = req.body;

    if (
      !Array.isArray(questionBankQuestionId) ||
      questionBankQuestionId.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "questionBankQuestionId must be a non-empty array",
      });
    }

    const updatedTest = await testModel.findOneAndUpdate(
      { _id: testId, "sections._id": sectionId },
      {
        $set: {
          "sections.$.questionBankQuestionId": questionBankQuestionId,
          "sections.$.sectionStatus": "complete",
        },
      },
      { new: true }
    );

    if (!updatedTest) {
      return res
        .status(404)
        .json({ success: false, message: "Test or Section not found" });
    }

    res.status(200).json({
      success: true,
      message: "Questions added and section marked as complete",
      data: updatedTest,
    });
  } catch (error) {
    console.error("Error adding questions:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getTestById = async (req, res) => {
  console.log("req.params.id)", req.params.id);
  try {
    const test = await testModel.findById(req.params.id);
    if (!test) {
      return res
        .status(404)
        .json({ success: false, message: "Test not found" });
    }
    res.status(200).json({ success: true, data: test });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
exports.getAllTests = async (req, res) => {
  try {
    const test = await testModel.find({}).sort({ _id: -1 });

    if (!test || test.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "No tests found" });
    }

    res.status(200).json({ success: true, data: test });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getTestSectionByTestId = async (req, res) => {
  try {
    const { testId } = req.params;

    // Check for valid ID
    // if (!mongoose.Types.ObjectId.isValid(testId)) {
    //   return res.status(400).json({ success: false, message: "Invalid Test ID" });
    // }

    const test = await testModel.findById(testId).select("sections");

    if (!test) {
      return res
        .status(404)
        .json({ success: false, message: "Test not found" });
    }

    res.status(200).json({ success: true, sections: test.sections });
  } catch (error) {
    console.error("Error in getTestSection:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// add Question manually
exports.addQuestionManually = async (req, res) => {
  try {
    const { testId } = req.params;
    const { sectionId, questionIds } = req.body;

    if (!sectionId || !Array.isArray(questionIds)) {
      return res.status(400).json({
        success: false,
        message: "sectionId and questionIds[] are required",
      });
    }

    const test = await testModel.findById(testId);
    if (!test)
      return res
        .status(404)
        .json({ success: false, message: "Test not found" });

    const section = test.sections.find(
      (sec) => sec._id.toString() === sectionId
    );
    if (!section)
      return res
        .status(404)
        .json({ success: false, message: "Section not found in test" });

    // Merge and deduplicate question IDs
    const existingSet = new Set(section.questionBankQuestionId || []);
    questionIds.forEach((id) => existingSet.add(id));

    section.questionBankQuestionId = Array.from(existingSet);

    await test.save();

    res.status(200).json({
      success: true,
      message: "Question IDs added successfully",
      updatedQuestionBank: section.questionBankQuestionId,
    });
  } catch (error) {
    console.error("Add Question IDs Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Remove the Topics from section
// controllers/testController.js

exports.removeSelectedTopic = async (req, res) => {
  try {
    const { testId, sectionId } = req.params;
    const { topicName, chapterId } = req.body;

    const test = await testModel.findById(testId);
    if (!test) {
      return res
        .status(404)
        .json({ success: false, message: "Test not found" });
    }

    const section = test.sections.id(sectionId);
    if (!section) {
      return res
        .status(404)
        .json({ success: false, message: "Section not found" });
    }

    // Filter out the topic
    section.topic = section.topic.filter(
      (t) => !(t.topicName === topicName && t.chapterId === chapterId)
    );

    await test.save();

    res
      .status(200)
      .json({ success: true, message: "Topic removed successfully", section });
  } catch (error) {
    console.error("Error removing topic:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.updateTheTestMode = async (req, res) => {
  try {
    const { testId } = req.params;
    const { testMode, testDuration } = req.body;

    // Validate input
    if (!testId || !testMode) {
      return res.status(400).json({
        success: false,
        message: "testId and testMode are required",
      });
    }

    // Update the testMode
    const updatedTest = await testModel.findOneAndUpdate(
      { _id: testId },
      { testMode: testMode, testDuration: testDuration },
      { new: true, runValidators: true }
    );

    if (!updatedTest) {
      return res
        .status(404)
        .json({ success: false, message: "Test not found" });
    }

    // Success response
    res.status(200).json({
      success: true,
      message: "Test mode updated successfully",
      data: updatedTest,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.GetTheQuestionsBytestAndSectionID = async (req, res) => {
  const { testId, sectionId } = req.params; // sectionId passed in URL

  console.log("sectionId", testId, sectionId);
  try {
    // Fetch the test by its testId
    const test = await testModel.findById(testId);

    if (!test) {
      return res.status(404).json({ message: "Test not found" });
    }

    console.log("test", test);
    console.log("Full sections:", test.sections);

    // Find the section with the given sectionId
    const section = test.sections?.find(
      (sec) => sec?._id?.toString() === sectionId?.toString()
    );
    console.error("Section Find Error:", {
      sectionId,
      sections: test.sections,
    });

    if (!section) {
      return res.status(404).json({ message: "Section not found" });
    }

    const questionIds = section.questionBankQuestionId;

    if (!Array.isArray(questionIds) || questionIds.length === 0) {
      return res
        .status(400)
        .json({ message: "No question IDs found in section" });
    }

    // Fetch questions from question microservice
    const response = await axios.post("http://localhost:8003/api/QB/getByIds", {
      questionIds,
    });

    return res.status(200).json({
      sectionName: section.subject,
      questionList: response.data.questions,
    });
  } catch (error) {
    console.error("Error fetching questions:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.GetAllQuestionsByTestID = async (req, res) => {
  const { testId } = req.params;

  try {
    // Fetch the test
    const test = await testModel.findById(testId);

    if (!test) {
      return res.status(404).json({ message: "Test not found" });
    }

    const allSectionQuestions = [];

    // Loop through all sections
    for (const section of test.sections || []) {
      const questionIds = section.questionBankQuestionId || [];

      // Filter valid IDs
      const validQuestionIds = questionIds.filter(
        (id) => id && mongoose.Types.ObjectId.isValid(id)
      );

      if (validQuestionIds.length > 0) {
        // Fetch questions from question microservice
        const response = await axios.post(QUESTION_MICROSERVICE_URL, {
          questionIds: validQuestionIds,
        });

        allSectionQuestions.push({
          sectionId: section._id,
          sectionName: section.subject,
          questionList: response.data.questions, // Adjust based on actual response structure
        });
      }
    }

    return res.status(200).json({
      testName: test.testName,
      allSectionQuestions,
    });
  } catch (error) {
    console.error("Error fetching all section questions:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.HandleExcelUpload = async (req, res) => {
  try {
    const { testId } = req.params;
    const fileBuffer = req.file.buffer;

    const workbook = XLSX.read(fileBuffer, { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(sheet);

    const qids = data
      .map((row) => row["Question Id"] || row["QID"])
      .filter(Boolean);

    if (!qids.length) {
      return res.status(400).json({ success: false, message: "No valid QIDs" });
    }

    if (!qids.length) {
      return res
        .status(400)
        .json({ success: false, message: "No valid QIDs found." });
    }
    const test = await testModel.findById(testId);
    if (!test) {
      res.status(404).json({ message: "Test Not Found" });
    }

    test.sections.forEach((sections) => {
      sections.questionBankQuestionId = [
        ...new Set([...(sections.questionBankQuestionId || 0), ...qids]),
      ];
    });

    await test.save();
    // You can now:
    // - Validate QIDs
    // - Save to DB
    // - Associate them with `testId`
    console.log("Extracted QIDs:", qids);

    res.json({ success: true, qids, message: "File processed successfully" });
  } catch (error) {
    console.error("Error fetching all section questions:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// handleSubmit / handle next
exports.AddSetionDetails = async (req, res) => {
  const testId = req.params.testId;
  const {
    sectionName,
    subjects,
    negativeMarksPerWrongAnswer,
    marksPerQuestion,
  } = req.body;

  try {
    const test = await testModel.findById(testId);
    if (!test) {
      return res.status(404).send({ message: "Test not found!" });
    }

    // ✅ Look for existing section by sectionName
    const existingSection = test.sections.find(
      (sec) =>
        sec.sectionName?.trim()?.toLowerCase() ===
        sectionName.trim().toLowerCase()
    );

    if (existingSection) {
      // ✅ Update if sectionName matched
      existingSection.subjects = subjects;
      existingSection.negativeMarksPerWrongAnswer = negativeMarksPerWrongAnswer;
      existingSection.marksPerQuestion = marksPerQuestion;

      await test.save();

      res.status(200).json({
        // message: "Section details added successfully!",
        sections: test.sections,
      });
    } else {
      //Add new section if not exists
      const newSection = {
        sectionName,
        subjects,
        negativeMarksPerWrongAnswer,
        marksPerQuestion,
      };

      test.sections.push(newSection);
      await test.save();

      res.status(200).json({
        // message: "Section details added successfully!",
        sections: test.sections,
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Error saving section details" });
  }
};

// udpate summery
exports.updateSectionMeta = async (req, res) => {
  const { testId, sectionId } = req.params;
  const {
    marksPerQuestion,
    negativeMarksPerWrongAnswer,
    minQuestionsAnswerable,
    testDuration, // if provided, update test duration at test level
  } = req.body;

  try {
    // Optional: update test duration
    if (testDuration !== undefined) {
      await testModel.findByIdAndUpdate(testId, {
        testDuration: testDuration.toString(),
      });
    }

    const test = await testModel.findOne({ _id: testId });
    if (!test) return res.status(404).json({ message: "Test not found" });

    const section = test.sections.find(
      (sec) => sec._id.toString() === sectionId
    );
    if (!section) return res.status(404).json({ message: "Section not found" });

    // Apply updates
    if (marksPerQuestion !== undefined)
      section.marksPerQuestion = marksPerQuestion;
    if (negativeMarksPerWrongAnswer !== undefined)
      section.negativeMarksPerWrongAnswer = negativeMarksPerWrongAnswer;
    if (minQuestionsAnswerable !== undefined)
      section.minQuestionsAnswerable = minQuestionsAnswerable;

    await test.save();

    res.status(200).json({ message: "Section metadata updated successfully!" });
  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({ message: "Failed to update section metadata" });
  }
};

updateSectionDetails = async (req, res) => {
  const { sectionId } = req.params;
  const updateData = req.body;

  await SectionModel.findByIdAndUpdate(sectionId, updateData);
  res.json({ success: true });
};
