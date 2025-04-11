const express = require("express");
const {
  createQuestionType,

  getAllQuestionTypes,
  getQuestionTypeById,
  updateQuestionType,
  deleteQuestionType,
} = require("../controllers/questionType");

const router = express.Router();

router.post("/", createQuestionType);

router.get("/", getAllQuestionTypes);
router.get("/:id", getQuestionTypeById); // Get a question type by ID
router.put("/:id", updateQuestionType); // Update a question type
router.delete("/:id", deleteQuestionType); // Delete a question type

module.exports = router;
