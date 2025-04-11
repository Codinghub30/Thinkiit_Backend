const mongoose = require("mongoose");
const Video = require("../../models/batch/video");
const NodeCache = require("node-cache");

const cache = new NodeCache({ stdTTL: 600, checkperiod: 120 });

exports.createVideo = async (req, res) => {
  try {
    const { className, subjectName, chapter, topic, video_link, category } =
      req.body;

    const newVideo = new Video({
      className,
      subjectName,
      chapter,
      topic,
      video_link,
      category,
    });

    await newVideo.save();
    res
      .status(201)
      .json({ message: "Video created successfully", data: newVideo });
  } catch (error) {
    console.error("Error creating video:", error);
    res.status(500).json({ message: "Failed to create video" });
  }
};

exports.getVideos = async (req, res) => {
  try {
    const videos = await Video.find();
    res.status(200).json(videos);
  } catch (error) {
    console.error("Error fetching videos:", error);
    res.status(500).json({ message: "Failed to fetch videos" });
  }
};

exports.deleteVideo = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedVideo = await Video.findByIdAndDelete(id);
    if (!deletedVideo) {
      return res.status(404).json({ message: "Video not found" });
    }
    res.status(200).json({ message: "Video deleted successfully" });
  } catch (error) {
    console.error("Error deleting video:", error);
    res.status(500).json({ message: "Failed to delete video" });
  }
};

exports.getVideosByClass = async (req, res) => {
  try {
    const className = req.params.className;
    let videos = await Video.find({ className }).sort({ createdAt: -1 });
    res.status(200).json({ data: videos });
  } catch (error) {
    console.error("Error fetching videos by class:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.getVideosBysubjectName = async (req, res) => {
  try {
    const subjectName = req.params.subjectName;
    let videos = await Video.find({ subjectName }).sort({ createdAt: -1 });
    res.status(200).json({ data: videos });
  } catch (error) {
    console.error("Error fetching videos by class:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.updateVideo = async (req, res) => {
  const id = req.params.id;
  console.log(id);
  const { subjectName, className, chapter, topic, video_link, category } =
    req.body;
  try {
    const video = await Video.findById(id);
    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }
    const updatedData = {};
    if (subjectName) updatedData.subjectName = subjectName;
    if (className) updatedData.className = className;
    if (chapter) updatedData.chapter = chapter;
    if (topic) updatedData.topic = topic;
    if (video_link) updatedData.video_link = video_link;
    if (category) updatedData.category = category;
    const updatedVideo = await Video.findByIdAndUpdate(id, updatedData, {
      new: true,
    });
    res
      .status(200)
      .json({ message: "Video updated successfully", updatedVideo });
  } catch (error) {
    console.error(" Error updating video:", error);
    res.status(500).json({ error: error.message });
  }
};
