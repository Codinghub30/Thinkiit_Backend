const mongoose = require("mongoose");

const newsletterSchema = new mongoose.Schema(
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
    newsImg: {
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

const newsletter = mongoose.model("NewsLetter", newsletterSchema);

module.exports = newsletter;
