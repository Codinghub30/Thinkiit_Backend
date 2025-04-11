const mongoose = require("mongoose");

const rightsSchema = new mongoose.Schema({
  dashboard: { type: Boolean, default: true },
  institute: { type: Boolean, default: true },
  admin: { type: Boolean, default: true },
  teacher: { type: Boolean, default: true },
  student: { type: Boolean, default: true },

  questionManagement: { type: Boolean, default: true },
  batchManagement: { type: Boolean, default: true },
  doubtManagement: { type: Boolean, default: true },

  testManagement: { type: Boolean, default: true },
  marketing: { type: Boolean, default: true },
  coupons: { type: Boolean, default: true },
  productsServices: { type: Boolean, default: true },
  tickets: { type: Boolean, default: true },
  omrUpload: { type: Boolean, default: true },
  notifications: { type: Boolean, default: true },
  payments: { type: Boolean, default: true },
  termsConditions: { type: Boolean, default: true },
  cancellationRefund: { type: Boolean, default: true },
  faq: { type: Boolean, default: true },
  analytics: { type: Boolean, default: true },
});

const AdminSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phoneNumber: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: "" },
  rights: { type: rightsSchema, default: {} },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },
  instituteId: { type: String, required: true, index: true },
});

const AdminModel = mongoose.model("Admin", AdminSchema);
module.exports = AdminModel;
