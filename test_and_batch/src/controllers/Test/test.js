const Test = require("../../models/Test/test");
const TestTemplate = require("../../models/Test/testTemplate");
const mongoose = require("mongoose");

// Create a test
exports.createTest = async (req, res) => {
  try {
    // Extracting data from request body
    const { templateId, sections } = req.body;

    if (!templateId || !sections || !Array.isArray(sections)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid data format. Ensure template_id and sections are provided correctly.",
      });
    }

    // Mapping request body fields to match schema
    const formattedSections = sections.map((section) => ({
      sectionTitle: section.sectionName,
      questionType: section.questionType,
      numberOfQuestions: section.numberOfQuestions,
      marksPerQuestion: section.marksPerSection,
      marksPerCorrectPart: section.marksPerCorrectPart,
      marksPerSection: section.marksPerSection,
      minQuestionsAnswerable: section.minQuestionsAnswerable,
      negativeMarksPerWrongAnswer: section.negativeMarksPerWrongAnswer,
      questionSelection: section.questionSelection,
      sectionStatus: section.section_status,
    }));

    // Create new test document
    const newTest = new Test({
      templateId: templateId,
      sections: formattedSections,
    });

    await newTest.save();

    res.status(201).json({
      success: true,
      message: "Test created successfully",
      data: newTest,
    });
  } catch (error) {
    console.error("Error creating test:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.addSectionToTest = async (req, res) => {
  try {
    const { testId } = req.params; // Get testId from request params

    const { sections } = req.body; // Extract the sections array
    if (!sections || !Array.isArray(sections) || sections.length === 0) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid sections data. Ensure an array with at least one section is provided.",
      });
    }

    // Take the first section from the array
    const sectionData = sections[0];

    const {
      sectionName,
      questionType,
      numberOfQuestions,
      marksPerQuestion,
      marksPerCorrectPart = 0,
      marksPerSection,
      minQuestionsAnswerable = 0,
      negativeMarksPerWrongAnswer = 0,
      questionSelection,
      section_status,
    } = sectionData; // Extract section fields

    console.log("Received Section Data:", sectionData);

    // Find the test by ID
    const test = await Test.findById(testId);
    if (!test) {
      return res
        .status(404)
        .json({ success: false, message: "Test not found" });
    }

    // Ensure `sections` array exists
    if (!test.sections) {
      test.sections = [];
    }

    // Validate and ensure numbers are properly cast
    const parsedMarksPerSection = marksPerSection
      ? Number(marksPerSection)
      : Number(numberOfQuestions) * Number(marksPerQuestion);

    if (
      !sectionName ||
      !questionType ||
      !numberOfQuestions ||
      !marksPerQuestion ||
      !questionSelection ||
      isNaN(parsedMarksPerSection)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid section data. Ensure all required fields are present and valid.",
      });
    }

    // Create a new section object
    const newSection = {
      sectionTitle: sectionName,
      questionType,
      numberOfQuestions: Number(numberOfQuestions),
      marksPerQuestion: Number(marksPerQuestion),
      marksPerCorrectPart: Number(marksPerCorrectPart),
      marksPerSection: parsedMarksPerSection,
      minQuestionsAnswerable: Number(minQuestionsAnswerable),
      negativeMarksPerWrongAnswer: Number(negativeMarksPerWrongAnswer),
      questionSelection,
      sectionStatus: section_status || "incomplete",
    };

    // Add the section to the test's sections array
    test.sections.push(newSection);
    const updatedTest = await test.save();

    res.status(200).json({
      success: true,
      message: "Section added successfully",
      data: updatedTest,
    });
  } catch (error) {
    console.error("Error adding section:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
// Get all tests
exports.getAllTests = async (req, res) => {
  try {
    const tests = await Test.find();
    res.status(200).json({ success: true, data: tests });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all tests with template data
exports.getAllTestsWithTemplate = async (req, res) => {
  try {
    // Fetch all tests and populate the template data
    const tests = await Test.find()
      .populate({
        path: "templateId", // Field in Test schema referring to TestTemplate
        model: "testTemplate", // The model name as registered in Mongoose
        select: "tempName tempDesc duration exam_type timerOption timerEnable", // Select specific fields
      })
      .exec();

    res.status(200).json({ success: true, data: tests });
  } catch (error) {
    console.error("Error fetching tests with template data:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
// Get a single test by ID
exports.getTestById = async (req, res) => {
  try {
    const test = await Test.findById(req.params.id);
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

exports.updateTest = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Find the existing test
    let existingTest = await Test.findById(id);
    if (!existingTest) {
      return res
        .status(404)
        .json({ success: false, message: "Test not found" });
    }

    // Merge updates while ensuring required fields are kept
    if (updates.sections) {
      updates.sections.forEach((updatedSection) => {
        const existingSection = existingTest.sections.find(
          (sec) => sec.sectionId === updatedSection.sectionId
        );

        if (existingSection) {
          Object.keys(updatedSection).forEach((key) => {
            existingSection[key] = updatedSection[key]; // Update only provided fields
          });
        } else {
          // If the section does not exist, add it
          existingTest.sections.push(updatedSection);
        }
      });
    }

    // Apply top-level updates
    Object.keys(updates).forEach((key) => {
      if (key !== "sections") {
        existingTest[key] = updates[key];
      }
    });

    // Save the updated test
    const updatedTest = await existingTest.save();

    res.status(200).json({ success: true, data: updatedTest });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateTest1 = async (req, res) => {
  try {
    const { testId, sectionId } = req.params;
    let { questionBankQuestionId } = req.body;

    //  Remove null values
    questionBankQuestionId = questionBankQuestionId.filter((id) => id !== null);

    if (
      !Array.isArray(questionBankQuestionId) ||
      questionBankQuestionId.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid question IDs. Ensure an array with at least one valid ID is provided.",
      });
    }

    // Find the test
    let test = await Test.findById(testId);
    if (!test) {
      return res
        .status(404)
        .json({ success: false, message: "Test not found" });
    }

    // Find the section inside the test
    let section = test.sections.find((sec) => sec._id.toString() === sectionId);
    if (!section) {
      return res
        .status(404)
        .json({ success: false, message: "Section not found in the test" });
    }

    const updatedTest = await Test.findOneAndUpdate(
      { _id: testId, "sections._id": sectionId }, // Find the test that contains the section
      {
        $set: {
          "sections.$.questionBankQuestionId": questionBankQuestionId,
          "sections.$.sectionStatus": "complete",
        }, //  Correctly updates the field inside the section
      },
      { new: true }
    );

    if (!updatedTest) {
      return res
        .status(404)
        .json({ success: false, message: "Test or Section not found" });
    }

    console.log("Updated Test:", updatedTest);

    res.status(200).json({
      success: true,
      message: "Section updated successfully",
      data: updatedTest,
    });
  } catch (error) {
    console.error("Error updating section:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// update the questions using sections id

exports.update_questions_by_sectionid = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Find the existing test
    let existingTest = await Test.findById(id);
    if (!existingTest) {
      return res
        .status(404)
        .json({ success: false, message: "Test not found" });
    }

    // Merge updates while ensuring required fields are kept
    if (updates.sections) {
      updates.sections.forEach((updatedSection) => {
        const existingSection = existingTest.sections.find(
          (sec) => sec.sectionId === updatedSection.sectionId
        );

        if (existingSection) {
          Object.keys(updatedSection).forEach((key) => {
            existingSection[key] = updatedSection[key]; // Update only provided fields
          });
        } else {
          // If the section does not exist, add it
          existingTest.sections.push(updatedSection);
        }
      });
    }

    // Apply top-level updates
    Object.keys(updates).forEach((key) => {
      if (key !== "sections") {
        existingTest[key] = updates[key];
      }
    });

    // Save the updated test
    const updatedTest = await existingTest.save();

    res.status(200).json({ success: true, data: updatedTest });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete a test by ID
exports.deleteTest = async (req, res) => {
  try {
    const deletedTest = await Test.findByIdAndDelete(req.params.id);
    if (!deletedTest) {
      return res
        .status(404)
        .json({ success: false, message: "Test not found" });
    }
    res
      .status(200)
      .json({ success: true, message: "Test deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete a specific section inside a test
exports.deleteSection = async (req, res) => {
  const { testId, sectionId } = req.params; // Extract test ID & section ID from URL

  console.log("test", testId, sectionId);
  try {
    // Find the test and remove the section
    const updatedTest = await Test.findByIdAndUpdate(
      testId,
      { $pull: { sections: { _id: sectionId } } }, // Removes matching section
      { new: true } // Return updated test document
    );

    if (!updatedTest) {
      return res
        .status(404)
        .json({ success: false, message: "Test not found" });
    }

    res.status(200).json({
      success: true,
      message: "Section deleted successfully",
      data: updatedTest,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAllTests = async (req, res) => {
  try {
    const tests = await Test.aggregate([
      {
        // Convert templateId (string) into an ObjectId and store it in a new field.
        $addFields: {
          templateObjId: { $toObjectId: "$templateId" },
        },
      },
      {
        $lookup: {
          from: "testtemplates", // Make sure this is the actual collection name for your test templates.
          localField: "templateObjId",
          foreignField: "_id",
          as: "templateData",
        },
      },
      {
        $unwind: {
          path: "$templateData",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: 1,
          templateId: 1,
          sections: 1,
          createdAt: 1,
          updatedAt: 1,
          templatename: "$templateData.templatename", // Bring in the template name.
        },
      },
    ]);

    res.status(200).json({ success: true, data: tests });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
