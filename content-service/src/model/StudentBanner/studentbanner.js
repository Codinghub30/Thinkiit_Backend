
const mongoose = require("mongoose");

const bannerSchema = new mongoose.Schema(
  {
    bannerImg: {
      type: String,
    },
    promotionName: {
      type: String,
    },
  },
  { timestamps: true }  
);

const bannerModel = mongoose.model("StudentBanner", bannerSchema);
module.exports = bannerModel;