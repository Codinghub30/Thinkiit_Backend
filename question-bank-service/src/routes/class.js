const express = require("express");
const {
  createClass,
  getAllClasses,
  getClassById,
  updateClass,
  deleteClass,
} = require("../controllers/class");

const router = express.Router();

router.post("/", createClass);
router.get("/", getAllClasses);
router.get("/:id", getClassById); // Get a class by ID
router.put("/:id", updateClass); // Update a class by ID
router.delete("/:id", deleteClass); // Delete a class by ID

module.exports = router;
