const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema(
  {
    couponName: {
      type: String,
      required: true,
      trim: true
    },
    couponCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true
    },
    description: {
      type: String,
      trim: true
    },
    validFrom: {
      type: String,
      required: true
    },
    validTill: {
      type: String,
      required: true
    },
    usageCount: {
      type: Number,
      default: 0
    },
    institute: {
      type: String,
      required: true
    }
  },
  { timestamps: true }
);

const Coupon = mongoose.model("Coupon", couponSchema);
module.exports = Coupon;
