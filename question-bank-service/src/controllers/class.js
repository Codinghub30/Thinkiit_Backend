const Class = require("../models/class");

// Create a new class
const createClass = async (req, res) => {
  try {
    const { className } = req.body;

    if (!className) {
      return res.status(400).json({ message: "Class name is required" });
    }

    const newClass = new Class({ className });
    await newClass.save();

    res
      .status(201)
      .json({ message: "Class created successfully", data: newClass });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get all classes
const getAllClasses = async (req, res) => {
  try {
    const classes = await Class.find();
    res.status(200).json(classes);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get a single class by ID
const getClassById = async (req, res) => {
  try {
    const { id } = req.params;
    const classData = await Class.findById(id);

    if (!classData) {
      return res.status(404).json({ message: "Class not found" });
    }

    res.status(200).json(classData);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update a class by ID
const updateClass = async (req, res) => {
  try {
    const { id } = req.params;
    const { className } = req.body;

    const updatedClass = await Class.findByIdAndUpdate(
      id,
      { className },
      { new: true }
    );

    if (!updatedClass) {
      return res.status(404).json({ message: "Class not found" });
    }

    res
      .status(200)
      .json({ message: "Class updated successfully", data: updatedClass });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Delete a class by ID
const deleteClass = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedClass = await Class.findByIdAndDelete(id);

    if (!deletedClass) {
      return res.status(404).json({ message: "Class not found" });
    }

    res.status(200).json({ message: "Class deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  createClass,
  getAllClasses,
  getClassById,
  updateClass,
  deleteClass,
};
