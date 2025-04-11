const mongoose = require("mongoose");

const chapterSchema = new mongoose.Schema({
  chapterName: {
    type: String,
    required: true,
    index: true,
  },
  subjectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Subject",
    required: true,
  },
});

const Chapter = mongoose.model("Chapter", chapterSchema);
module.exports = Chapter;
