const mongoose = require("mongoose");

const termsConditionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: Array,
      required: true,
    },
  },
  { timestamps: true }
);

const TermsCondition = mongoose.model("TermsCondition", termsConditionSchema);
module.exports = TermsCondition;
