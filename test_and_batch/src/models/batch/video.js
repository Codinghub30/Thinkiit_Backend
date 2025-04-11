const mongoose = require("mongoose");

const videoSchema = new mongoose.Schema({
  className: {
    type: String,
  },
  subjectName: {
    type: String,
  },
  category: {
    type: String,
  },
  chapter: { type: String, required: true },
  topic: { type: String },
  video_link: { type: String, required: true },
});

const Video = mongoose.model("Video", videoSchema);

module.exports = Video;
