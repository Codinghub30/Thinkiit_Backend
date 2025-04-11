const QuestionType = require("../models/questionType");
const { setCache, getCache, deleteCache } = require("../utils/cacheService");

// Create a new question type with Redis Caching
const createQuestionType = async (req, res) => {
  try {
    const { questionType, title } = req.body;

    if (!questionType) {
      return res
        .status(400)
        .json({ message: "Question type name is required" });
    }

    const newQuestionType = await QuestionType.create({ questionType, title });
    await deleteCache("questionTypes");

    res.status(201).json({
      message: "Question type created successfully",
      data: newQuestionType,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get all question types with Redis caching
const getAllQuestionTypes = async (req, res) => {
  try {
    const cachedQuestionTypes = await getCache("questionTypes");
    if (cachedQuestionTypes) {
      return res.status(200).json(cachedQuestionTypes);
    }

    const questionTypes = await QuestionType.find();
    await setCache("questionTypes", questionTypes, 3600);
    res.status(200).json(questionTypes);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get a question type by ID with Redis caching
const getQuestionTypeById = async (req, res) => {
  try {
    const { id } = req.params;
    const cachedQuestionType = await getCache(`questionType:${id}`);
    if (cachedQuestionType) {
      return res.status(200).json(cachedQuestionType);
    }

    const questionType = await QuestionType.findById(id);
    if (!questionType) {
      return res.status(404).json({ message: "Question type not found" });
    }

    await setCache(`questionType:${id}`, questionType, 3600);
    res.status(200).json(questionType);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update a question type with cache invalidation
const updateQuestionType = async (req, res) => {
  try {
    const { id } = req.params;
    const { questionType } = req.body;

    const updatedQuestionType = await QuestionType.findByIdAndUpdate(
      id,
      { questionType },
      { new: true }
    );

    if (!updatedQuestionType) {
      return res.status(404).json({ message: "Question type not found" });
    }

    await deleteCache("questionTypes");
    await deleteCache(`questionType:${id}`);
    res.status(200).json({
      message: "Question type updated successfully",
      data: updatedQuestionType,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Delete a question type with cache invalidation
const deleteQuestionType = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedQuestionType = await QuestionType.findByIdAndDelete(id);

    if (!deletedQuestionType) {
      return res.status(404).json({ message: "Question type not found" });
    }

    await deleteCache("questionTypes");
    await deleteCache(`questionType:${id}`);
    res.status(200).json({ message: "Question type deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  createQuestionType,
  getAllQuestionTypes,
  getQuestionTypeById,
  updateQuestionType,
  deleteQuestionType,
};
