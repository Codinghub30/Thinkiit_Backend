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

const TeacherSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  phoneNumber: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  branch: { type: String },
  rights: { type: rightsSchema, default: {} },
  experience: { type: Number, required: true, min: 0 },
  address: { type: String, required: true, trim: true },
  subjects: { type: Array, required: true },
  instituteId: { type: String, required: true },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },
});

const TeacherModel = mongoose.model("Teacher", TeacherSchema);
module.exports = TeacherModel;
