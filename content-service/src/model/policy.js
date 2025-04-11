const mongoose = require("mongoose");

const policySchema = new mongoose.Schema(
  {
    policyTitle: {
      type: String,
      required: true,
    },
    policyDescription: {
      type: Array,
      required: true,
    },
  },
  { timestamps: true }
);

const policy = mongoose.model("policy", policySchema);
module.exports = policy;
