const mongoose = require("mongoose");

const faqSchema = new mongoose.Schema(
  {
    faqTitle: {
      type: String,
      required: true,
    },
    faqDescription: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const faq = mongoose.model("faq", faqSchema);
module.exports = faq;
