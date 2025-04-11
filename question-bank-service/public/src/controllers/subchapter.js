const Subchapter = require("../models/subchapter");
const Chapter = require("../models/chapter");

// Create a new subchapter
const createSubchapter = async (req, res) => {
  try {
    const { subchapterName, chapterId } = req.body;

    if (!subchapterName || !chapterId) {
      return res
        .status(400)
        .json({ message: "Subchapter name and chapter ID are required" });
    }

    // Check if the chapter exists
    const existingChapter = await Chapter.findById(chapterId);
    if (!existingChapter) {
      return res.status(404).json({ message: "Chapter not found" });
    }

    const newSubchapter = new Subchapter({ subchapterName, chapterId });
    await newSubchapter.save();

    res
      .status(201)
      .json({
        message: "Subchapter created successfully",
        data: newSubchapter,
      });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Bulk insert subchapters
const bulkCreateSubchapters = async (req, res) => {
  try {
    const { subchapters } = req.body; // Expecting an array of subchapters [{ subchapterName, chapterId }]

    if (!Array.isArray(subchapters) || subchapters.length === 0) {
      return res.status(400).json({ message: "Subchapters array is required" });
    }

    // Validate all chapters exist
    const chapterIds = [...new Set(subchapters.map((sub) => sub.chapterId))];
    const chapters = await Chapter.find({ _id: { $in: chapterIds } });

    if (chapters.length !== chapterIds.length) {
      return res
        .status(400)
        .json({ message: "One or more chapter IDs are invalid" });
    }

    const createdSubchapters = await Subchapter.insertMany(subchapters);
    res
      .status(201)
      .json({
        message: "Subchapters created successfully",
        data: createdSubchapters,
      });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get all subchapters
const getAllSubchapters = async (req, res) => {
  try {
    const subchapters = await Subchapter.find().populate(
      "chapterId",
      "chapterName"
    );
    res.status(200).json(subchapters);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get subchapters by chapter ID
const getSubchaptersByChapterId = async (req, res) => {
  try {
    const { chapterId } = req.params;
    const subchapters = await Subchapter.find({ chapterId }).populate(
      "chapterId",
      "chapterName"
    );

    if (subchapters.length === 0) {
      return res
        .status(404)
        .json({ message: "No subchapters found for this chapter" });
    }

    res.status(200).json(subchapters);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update a subchapter
const updateSubchapter = async (req, res) => {
  try {
    const { id } = req.params;
    const { subchapterName, chapterId } = req.body;

    if (chapterId) {
      const existingChapter = await Chapter.findById(chapterId);
      if (!existingChapter) {
        return res.status(404).json({ message: "Chapter not found" });
      }
    }

    const updatedSubchapter = await Subchapter.findByIdAndUpdate(
      id,
      { subchapterName, chapterId },
      { new: true }
    );

    if (!updatedSubchapter) {
      return res.status(404).json({ message: "Subchapter not found" });
    }

    res
      .status(200)
      .json({
        message: "Subchapter updated successfully",
        data: updatedSubchapter,
      });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Delete a subchapter
const deleteSubchapter = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedSubchapter = await Subchapter.findByIdAndDelete(id);

    if (!deletedSubchapter) {
      return res.status(404).json({ message: "Subchapter not found" });
    }

    res.status(200).json({ message: "Subchapter deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  createSubchapter,
  bulkCreateSubchapters,
  getAllSubchapters,
  getSubchaptersByChapterId,
  updateSubchapter,
  deleteSubchapter,
};
