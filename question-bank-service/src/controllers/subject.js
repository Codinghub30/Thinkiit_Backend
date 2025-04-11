const Subject = require("../models/subject");
const Class = require("../models/class");
const { setCache, getCache, deleteCache } = require("../utils/cacheService");

// Create a new subject with Redis Caching
const createSubject = async (req, res) => {
  try {
    const { subjectName } = req.body;

    if (!subjectName) {
      return res
        .status(400)
        .json({ message: "Subject name and class ID are required" });
    }

    // Save subject in DB
    const newSubject = await Subject.create({ subjectName });

    // Clear related cache (if any) so next fetch is fresh
    await deleteCache("subjects");

    res
      .status(201)
      .json({ message: "Subject created successfully", data: newSubject });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get all subjects with Redis caching
const getAllSubjects = async (req, res) => {
  try {
    const cachedSubjects = await getCache("subjects");
    if (cachedSubjects) {
      return res.status(200).json(cachedSubjects);
    }

    const subjects = await Subject.find();
    await setCache("subjects", subjects, 3600);
    res.status(200).json(subjects);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get a single subject by ID
const getSubjectById = async (req, res) => {
  try {
    const { id } = req.params;
    const subject = await Subject.findById(id);
    if (!subject) {
      return res.status(404).json({ message: "Subject not found" });
    }
    res.status(200).json(subject);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get subjects by class ID
const getSubjectsByClassId = async (req, res) => {
  try {
    const { classId } = req.params;
    const subjects = await Subject.find({ classId }).populate(
      "classId",
      "className"
    );
    if (!subjects.length) {
      return res
        .status(404)
        .json({ message: "No subjects found for this class" });
    }
    res.status(200).json(subjects);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update a subject
const updateSubject = async (req, res) => {
  try {
    const { id } = req.params;
    const { subjectName } = req.body;

    if (id) {
      const existingClass = await Class.findById(id);
      if (!existingClass) {
        return res.status(404).json({ message: "Class not found" });
      }
    }

    const updatedSubject = await Subject.findByIdAndUpdate(
      id,
      { subjectName },
      { new: true }
    );
    if (!updatedSubject) {
      return res.status(404).json({ message: "Subject not found" });
    }

    await deleteCache("subjects");
    res
      .status(200)
      .json({ message: "Subject updated successfully", data: updatedSubject });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Delete a subject
const deleteSubject = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedSubject = await Subject.findByIdAndDelete(id);
    if (!deletedSubject) {
      return res.status(404).json({ message: "Subject not found" });
    }
    await deleteCache("subjects");
    res.status(200).json({ message: "Subject deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  createSubject,
  getAllSubjects,
  getSubjectById,
  getSubjectsByClassId,
  updateSubject,
  deleteSubject,
};
