const express = require("express");
const {
  createChapter,
  bulkCreateChapters,
  getAllChapters,
  getChaptersBySubjectId,
  updateChapter,
  deleteChapter,
  bulkCreateRandomChapters,
} = require("../controllers/chapter");

const router = express.Router();

router.post("/", createChapter); // Create a chapter
router.post("/bulk", bulkCreateChapters); // Bulk create chapters
router.post("/bulkRandom", bulkCreateRandomChapters); // Bulk create chapters
router.get("/", getAllChapters); // Get all chapters
router.get("/subject/:subjectId", getChaptersBySubjectId); // Get chapters by subject ID
router.put("/:id", updateChapter); // Update a chapter
router.delete("/:id", deleteChapter); // Delete a chapter

module.exports = router;
