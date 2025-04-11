const mongoose = require("mongoose");

const BatchPurchaseSchema = new mongoose.Schema(
  {
    student_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StudentProfile",
      required: true,
    },
    batch_id: { type: String },
    batch_name: { type: String },
    price: {
      type: Number,
    },
    targetyear: { type: String },
    payment_status: { type: String, enum: ["paid", "unpaid"], default: "paid" },
    type: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("BatchPurchase", BatchPurchaseSchema);
