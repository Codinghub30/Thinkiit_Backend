const mongoose = require("mongoose");

const ebookSchema = new mongoose.Schema(
  {
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
    book_file_path: { type: String, required: true },
  },
  { timestamps: true }
);

const Ebook = mongoose.model("Ebook", ebookSchema);

module.exports = Ebook;
