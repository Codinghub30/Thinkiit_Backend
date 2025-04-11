const express = require("express");
const {
  createSubchapter,
  bulkCreateSubchapters,
  getAllSubchapters,
  getSubchaptersByChapterId,
  updateSubchapter,
  deleteSubchapter,
} = require("../controllers/subchapter");

const router = express.Router();

router.post("/", createSubchapter); // Create a subchapter
router.post("/bulk", bulkCreateSubchapters); // Bulk create subchapters
router.get("/", getAllSubchapters); // Get all subchapters
router.get("/chapter/:chapterId", getSubchaptersByChapterId); // Get subchapters by chapter ID
router.put("/:id", updateSubchapter); // Update a subchapter
router.delete("/:id", deleteSubchapter); // Delete a subchapter

module.exports = router;
