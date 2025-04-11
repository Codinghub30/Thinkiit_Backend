const AdminModel = require("../models/admin");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const { setCache, getCache, deleteCache } = require("../utils/cacheService");

const JWT_SECRET = process.env.JWT_SECRET || "kalpakosh";

exports.createAdmin = async (req, res) => {
  try {
    const { name, email, phoneNumber, password, instituteId, role } = req.body;

    // Validate input
    if (!name || !email || !phoneNumber || !password) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    // Check if admin already exists
    const existingAdmin = await AdminModel.findOne({ email });
    if (existingAdmin) {
      return res
        .status(400)
        .json({ success: false, message: "Admin already exists" });
    }

    //  password is hashed before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    const newAdmin = new AdminModel({
      name,
      email,
      phoneNumber,
      instituteId,
      role,
      password: hashedPassword,
    });

    await newAdmin.save();
    // Clear cache for this institute's admins
    await deleteCache(instituteId, "admins");

    res.status(201).json({
      success: true,
      message: "Admin created successfully",
      data: newAdmin,
    });
  } catch (error) {
    console.error("Error creating admin:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin Login
exports.loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const Admin = await AdminModel.findOne({ email });
    if (!Admin) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }
    const isMatch = await bcrypt.compare(password, Admin.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password." });
    }

    const token = jwt.sign(
      { id: Admin._id, rights: Admin.rights, instituteId: Admin.instituteId },
      JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: Admin._id,
        name: Admin.name,
        email: Admin.email,
        instituteId: Admin.instituteId,
        rights: Admin.rights,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phoneNumber, password } = req.body;

    // Find the admin by ID
    const existingAdmin = await AdminModel.findById(id);
    if (!existingAdmin) {
      return res
        .status(404)
        .json({ success: false, message: "Admin not found" });
    }

    // Update only the fields that are provided
    if (name) existingAdmin.name = name;
    if (email) existingAdmin.email = email;
    if (phoneNumber) existingAdmin.phoneNumber = phoneNumber;
    if (password) {
      existingAdmin.password = await bcrypt.hash(password, 10);
    }

    await existingAdmin.save();

    // Clear cache for this institute's admins
    await deleteCache(existingAdmin.instituteId, "admins");

    res.status(200).json({
      success: true,
      message: "Admin updated successfully",
      data: existingAdmin,
    });
  } catch (error) {
    console.error("Error updating admin:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

//  Get all Admins
exports.getAllAdmins = async (req, res) => {
  try {
    const { instituteId } = req.params;

    const cacheKey = "admins";

    const cachedData = await getCache(instituteId, cacheKey);
    if (cachedData) {
      return res.status(200).json({
        success: true,
        data: cachedData,
        source: "cache",
      });
    }

    const Admins = await AdminModel.find({ instituteId }).select("-password");

    await setCache(instituteId, cacheKey, Admins);
    res.status(200).json({ success: true, data: Admins });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Admin by ID
exports.getAdminById = async (req, res) => {
  try {
    const Admin = await AdminModel.findById(req.params.id).select("-password");
    if (!Admin)
      return res
        .status(404)
        .json({ success: false, message: "Admin not found" });

    res.status(200).json({ success: true, data: Admin });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Assign rights to Admin
exports.assignAdminrights = async (req, res) => {
  try {
    const { rights } = req.body;
    const Admin = await AdminModel.findByIdAndUpdate(
      req.params.id,
      { rights },
      { new: true }
    );

    if (!Admin)
      return res
        .status(404)
        .json({ success: false, message: "Admin not found" });

    res.status(200).json({
      success: true,
      message: "Admin rights updated successfully",
      data: Admin,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

//  Delete Admin
exports.deleteAdmin = async (req, res) => {
  try {
    const Admin = await AdminModel.findByIdAndDelete(req.params.id);
    if (!Admin)
      return res
        .status(404)
        .json({ success: false, message: "Admin not found" });

    await deleteCache(Admin.instituteId, "admins");
    res
      .status(200)
      .json({ success: true, message: "Admin deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { email, oldPassword, newPassword } = req.body;

    // Validate inputs
    if (!email || !oldPassword || !newPassword) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    // Find admin by email
    const admin = await AdminModel.findOne({ email });
    if (!admin) {
      return res
        .status(404)
        .json({ success: false, message: "Admin not found" });
    }

    // Check if old password is correct
    const isMatch = bcrypt.compare(oldPassword, admin.password);

    if (!isMatch) {
      return res
        .status(400)
        .json({ success: false, message: "Old password is incorrect" });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    admin.password = hashedPassword;
    await admin.save();

    res
      .status(200)
      .json({ success: true, message: "Password changed successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Find admin by email
    const admin = await AdminModel.findOne({ email });
    if (!admin) {
      return res
        .status(404)
        .json({ success: false, message: "Admin not found" });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    admin.resetPasswordToken = resetToken;
    admin.resetPasswordExpires = Date.now() + 3600000;
    await admin.save();

    // Send reset link via email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.NodeMailer_Email,
        pass: process.env.NodeMailer_password,
      },
    });

    const mailOptions = {
      from: "developersnnc@gmail.com",
      to: admin.email,
      subject: "Password Reset Request",
      html: `<p>You requested a password reset. Click the link below to reset your password:</p>
             <p><a href="http://localhost:3000/reset-password/${resetToken}">Reset Password</a></p>
             <p>This link will expire in 1 hour.</p>`,
    };

    await transporter.sendMail(mailOptions);

    res
      .status(200)
      .json({ success: true, message: "Password reset link sent to email" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;

    // Validate input
    if (!newPassword) {
      return res
        .status(400)
        .json({ success: false, message: "New password is required" });
    }

    // Find admin by reset token
    const admin = await AdminModel.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!admin) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid or expired token" });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password & clear reset token
    admin.password = hashedPassword;
    admin.resetPasswordToken = undefined;
    admin.resetPasswordExpires = undefined;
    await admin.save();

    res
      .status(200)
      .json({ success: true, message: "Password reset successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
