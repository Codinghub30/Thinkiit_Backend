const Chapter = require("../models/chapter");
const Subject = require("../models/subject");
const { setCache, getCache, deleteCache } = require("../utils/cacheService");

// Create a new chapter with Redis Caching
const createChapter = async (req, res) => {
  try {
    const { chapterName, subjectId, classId } = req.body;

    if (!chapterName || !subjectId) {
      return res
        .status(400)
        .json({ message: "Chapter name and subject ID are required" });
    }

    let existingSubject = await getCache(`subject:${subjectId}`);
    if (!existingSubject) {
      existingSubject = await Subject.findById(subjectId);
      if (!existingSubject) {
        return res.status(404).json({ message: "Subject not found" });
      }
      await setCache(`subject:${subjectId}`, existingSubject, 1800);
    }

    const newChapter = await Chapter.create({
      chapterName,
      subjectId,
      classId,
    });
    await deleteCache("chapters");

    res
      .status(201)
      .json({ message: "Chapter created successfully", data: newChapter });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Bulk insert chapters with random data and cache invalidation
const bulkCreateRandomChapters = async (req, res) => {
  try {
    const { count = 100000, subjectId, classId } = req.body;
    if (!subjectId || !classId) {
      return res
        .status(400)
        .json({ message: "Subject ID and Class ID are required" });
    }

    let chapters = [];
    for (let i = 0; i < count; i++) {
      chapters.push({
        chapterName: `Random Chapter ${i + 1}`,
        subjectId,
        classId,
      });
    }

    const createdChapters = await Chapter.insertMany(chapters);
    await deleteCache("chapters");

    res.status(201).json({
      message: `${createdChapters.length} chapters created successfully.`,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Bulk insert chapters
const bulkCreateChapters = async (req, res) => {
  try {
    const { chapters } = req.body;
    if (!Array.isArray(chapters) || chapters.length === 0) {
      return res.status(400).json({ message: "Chapters array is required" });
    }

    const createdChapters = await Chapter.insertMany(chapters);
    await deleteCache("chapters");
    res.status(201).json({
      message: "Chapters created successfully",
      data: createdChapters,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get chapters by subject ID
const getChaptersBySubjectId = async (req, res) => {
  try {
    const { subjectId } = req.params;
    console.log("subjectId", subjectId);
    const chapters = await Chapter.find({ subjectId }).populate(
      "subjectId",
      "subjectName"
    );
    if (!chapters.length) {
      return res
        .status(404)
        .json({ message: "No chapters found for this subject" });
    }
    res.status(200).json(chapters);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update a chapter
const updateChapter = async (req, res) => {
  try {
    const { id } = req.params;
    const { chapterName, subjectId } = req.body;

    if (subjectId) {
      const existingSubject = await Subject.findById(subjectId);
      if (!existingSubject) {
        return res.status(404).json({ message: "Subject not found" });
      }
    }

    const updatedChapter = await Chapter.findByIdAndUpdate(
      id,
      { chapterName, subjectId },
      { new: true }
    );
    if (!updatedChapter) {
      return res.status(404).json({ message: "Chapter not found" });
    }

    await deleteCache("chapters");
    res
      .status(200)
      .json({ message: "Chapter updated successfully", data: updatedChapter });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Delete a chapter with cache invalidation
const deleteChapter = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedChapter = await Chapter.findByIdAndDelete(id);
    if (!deletedChapter) {
      return res.status(404).json({ message: "Chapter not found" });
    }
    await deleteCache("chapters");
    res.status(200).json({ message: "Chapter deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get all chapters
const getAllChapters = async (req, res) => {
  try {
    const cachedchapters = await getCache("chapters");
    if (cachedchapters) {
      return res.status(200).json(cachedchapters);
    }

    const chapters = await Chapter.find().populate("subjectId", "subjectName");
    await setCache("chapters", chapters, 3600);
    res.status(200).json(chapters);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
module.exports = {
  createChapter,
  bulkCreateChapters,
  getAllChapters,
  getChaptersBySubjectId,
  updateChapter,
  deleteChapter,
  bulkCreateRandomChapters,
};
