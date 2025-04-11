const topic = require("../models/topic");
const Chapter = require("../models/chapter");

// Create a new topic
const createtopic = async (req, res) => {
  try {
    const { topicName, chapterId } = req.body;

    if (!topicName || !chapterId) {
      return res
        .status(400)
        .json({ message: "topic name and chapter ID are required" });
    }

    // Check if the chapter exists
    const existingChapter = await Chapter.findById(chapterId);
    if (!existingChapter) {
      return res.status(404).json({ message: "Chapter not found" });
    }

    const newtopic = new topic({ topicName, chapterId });
    await newtopic.save();

    res.status(201).json({
      message: "topic created successfully",
      data: newtopic,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Bulk insert topics
const bulkCreatetopics = async (req, res) => {
  try {
    const { topics } = req.body; // Expecting an array of topics [{ topicName, chapterId }]

    if (!Array.isArray(topics) || topics.length === 0) {
      return res.status(400).json({ message: "topics array is required" });
    }

    // Validate all chapters exist
    const chapterIds = [...new Set(topics.map((sub) => sub.chapterId))];
    const chapters = await Chapter.find({ _id: { $in: chapterIds } });

    if (chapters.length !== chapterIds.length) {
      return res
        .status(400)
        .json({ message: "One or more chapter IDs are invalid" });
    }

    const createdtopics = await topic.insertMany(topics);
    res.status(201).json({
      message: "topics created successfully",
      data: createdtopics,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get all topics
const getAlltopics = async (req, res) => {
  try {
    const topics = await topic.find().populate("chapterId", "chapterName");
    res.status(200).json(topics);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get topics by chapter ID
const gettopicsByChapterId = async (req, res) => {
  try {
    const { chapterId } = req.params;

    const topics = await topic.find({ chapterId: chapterId });

    if (topics.length === 0) {
      return res
        .status(404)
        .json({ message: "No topics found for this chapter" });
    }

    res.status(200).json(topics);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update a topic
const updatetopic = async (req, res) => {
  try {
    const { id } = req.params;
    const { topicName, chapterId } = req.body;

    if (chapterId) {
      const existingChapter = await Chapter.findById(chapterId);
      if (!existingChapter) {
        return res.status(404).json({ message: "Chapter not found" });
      }
    }

    const updatedtopic = await topic.findByIdAndUpdate(
      id,
      { topicName, chapterId },
      { new: true }
    );

    if (!updatedtopic) {
      return res.status(404).json({ message: "topic not found" });
    }

    res.status(200).json({
      message: "topic updated successfully",
      data: updatedtopic,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Delete a topic
const deletetopic = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedtopic = await topic.findByIdAndDelete(id);

    if (!deletedtopic) {
      return res.status(404).json({ message: "topic not found" });
    }

    res.status(200).json({ message: "topic deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  createtopic,
  bulkCreatetopics,
  getAlltopics,
  gettopicsByChapterId,
  updatetopic,
  deletetopic,
};
