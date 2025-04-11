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
  //   classId: {
  //     type: mongoose.Schema.Types.ObjectId,
  //     ref: "Class",
  //     required: true,
  //   },
});

const Chapter = mongoose.model("Chapter", chapterSchema);
module.exports = Chapter;
