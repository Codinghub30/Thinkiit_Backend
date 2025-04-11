const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
    },

  blogimg: {
      type: String, 
      default: null,
    },
    isPublished: {
      type: Boolean,
      default: true, 
    },
  },
  { timestamps: true } 
);

const blog = mongoose.model("Blog", blogSchema);

module.exports = blog;
