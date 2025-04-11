const mongoose = require("mongoose");

const subchapterSchema = new mongoose.Schema({
  subchapterName: {
    type: String,
    required: true,
    index: true,
  },
  chapterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Chapter", // Reference to the Chapter model
    required: true,
  },
});

const Subchapter = mongoose.model("Subchapter", subchapterSchema);
module.exports = Subchapter;
