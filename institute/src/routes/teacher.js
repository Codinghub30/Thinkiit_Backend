const express = require("express");
const router = express.Router();
const {
  createTeacher,
  getAllTeachers,
  getTeacherById,
  deleteTeacher,
  updateTeacher,
} = require("../controllers/teacher");

// Create a teacher
router.post("/", createTeacher);
router.get("/", getAllTeachers);
router.get("/:id", getTeacherById);
router.delete("/delete/:id", deleteTeacher);
router.put("/:id", updateTeacher);

module.exports = router;
