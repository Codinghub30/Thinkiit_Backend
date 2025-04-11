const mongoose = require("mongoose");

const studentProfileSchema = new mongoose.Schema(
  {
    student_name: { type: String },
    email_id: { type: String },
    student_phone_no: { type: Number },
    student_wts_app_no: { type: Number },
    institute_name: { type: String },
    password: { type: String, required: true },
    new_password_change: { type: Boolean, default: false },
    profile_file_path: { type: String },
    roll_no: { type: String },
    student_active_status: { type: Boolean, default: true },
    fcm_token: { type: String },
    studentClass: { type: String },
    board: { type: String },
    city: { type: String },
    country: { type: String },
    gender: { type: String, enum: ["Male", "Female", "Other"] },
    parent_phone_no: { type: Number },
    parent_wts_app_no: { type: Number },
    state: { type: String },
    instituteId: { type: String },
    userId: { type: String, unique: true },
    batches: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "BatchPurchase",
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("StudentProfile", studentProfileSchema);
