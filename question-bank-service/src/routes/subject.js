const express = require("express");
const {
  createSubject,
  getAllSubjects,
  getSubjectById,
  getSubjectsByClassId,
  updateSubject,
  deleteSubject,
} = require("../controllers/subject");

const router = express.Router();

router.post("/", createSubject); // Create a subject
router.get("/", getAllSubjects); // Get all subjects
router.get("/:id", getSubjectById); // Get a subject by ID
router.get("/class/:classId", getSubjectsByClassId); // Get subjects by class ID
router.put("/:id", updateSubject); // Update a subject
router.delete("/:id", deleteSubject); // Delete a subject

module.exports = router;
