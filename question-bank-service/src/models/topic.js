const mongoose = require("mongoose");

const topicSchema = new mongoose.Schema({
  topicName: {
    type: String,
    required: true,
    index: true,
  },
  chapterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Chapter",
    required: true,
  },
});

const topic = mongoose.model("topic", topicSchema);
module.exports = topic;
