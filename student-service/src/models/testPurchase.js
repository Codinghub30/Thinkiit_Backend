const mongoose = require("mongoose");

const TestPurchaseSchema = new mongoose.Schema({
     student_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
        required: true,
      },
      batch_id: { type: String },
      test_name: { type: String },
      price: {
        type: Number,
      },
      targetyear: { type: String },
      payment_status: { type: String, enum: ["paid", "unpaid"], default: "paid" },
    },{timestamps:true});

module.exports = mongoose.model("TestPurchase", TestPurchaseSchema);
