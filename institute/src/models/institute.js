const mongoose = require("mongoose");

const instituteSchema = new mongoose.Schema(
  {
    instituteName: { type: String, required: true, unique: true },
    contactPerson: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phoneNumber: { type: String, required: true },
    city: { type: String, required: true },
    GSTNumber: { type: String, required: true },
    address: { type: String, required: true },
    pincode: { type: Number, required: true },
    wallet: { type: Number, default: 0 },
    createdBy: { type: String, required: true },
    isKalpakosh: { type: Boolean, required: true },
    instituteLogo: { type: String },
    status: { type: String, enum: ["Active", "Inactive"], default: "Active" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Institute", instituteSchema);
