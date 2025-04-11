const TeacherModel = require("../models/teacher");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
exports.createTeacher = async (req, res) => {
  try {
    const {
      name,
      phoneNumber,
      email,
      experience,
      address,
      subjects,
      instituteId,
      password,
      branch,
    } = req.body;

    if (
      !name ||
      !phoneNumber ||
      !email ||
      !experience ||
      !address ||
      !subjects
    ) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }
    const existingTeacher = await TeacherModel.findOne({ email });
    if (existingTeacher) {
      return res
        .status(400)
        .json({ success: false, message: "Teacher already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newTeacher = new TeacherModel({
      name,
      phoneNumber,
      email,
      experience,
      address,
      subjects,
      instituteId,
      branch,
      password: hashedPassword,
    });

    await newTeacher.save();
    res.status(201).json({
      success: true,
      message: "Teacher created successfully",
      data: newTeacher,
    });
  } catch (error) {
    console.error("Error creating teacher:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// teacher Login
exports.loginteacher = async (req, res) => {
  try {
    const { email, password } = req.body;

    const Teacher = await TeacherModel.findOne({ email });
    if (!Teacher) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }
    const isMatch = await bcrypt.compare(password, Teacher.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password." });
    }

    const token = jwt.sign(
      { id: Teacher._id, rights: Teacher.rights },
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
        id: Teacher._id,
        TeacherName: Teacher.name,
        email: Teacher.email,
        rights: Teacher.rights,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
exports.getAllTeachers = async (req, res) => {
  try {
    const teachers = await TeacherModel.find();
    res.status(200).json({
      success: true,
      count: teachers.length,
      data: teachers,
    });
  } catch (error) {
    console.error("Error fetching teachers:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

exports.getTeacherById = async (req, res) => {
  try {
    const id = req.params.id;
    const teacher = await TeacherModel.findById(id);
    if (!teacher) {
      return res
        .status(404)
        .json({ success: false, message: "Teacher not found" });
    }
    res.status(200).json({ success: true, data: teacher });
  } catch (error) {
    console.error("Error fetching teacher:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
exports.deleteTeacher = async (req, res) => {
  try {
    const id = req.params.id;

    const deletedTeacher = await TeacherModel.findByIdAndDelete(id);

    if (!deletedTeacher) {
      return res
        .status(404)
        .json({ success: false, message: "Teacher not found" });
    }
    res.status(200).json({
      success: true,
      message: "Teacher deleted successfully",
      data: deletedTeacher,
    });
  } catch (error) {
    console.error("Error deleting teacher:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

exports.updateTeacher = async (req, res) => {
  try {
    const id = req.params.id;
    const { name, phoneNumber, email, experience, address, branch, subjects } =
      req.body;

    let update = {};
    if (name) update.name = name;
    if (phoneNumber) update.phoneNumber = phoneNumber;
    if (email) update.email = email;
    if (experience) update.experience = experience;
    if (address) update.address = address;
    if (subjects) update.subjects = subjects;
    if (branch) update.branch = branch;

    const updatedTeacher = await TeacherModel.findByIdAndUpdate(id, update, {
      new: true,
    });
    if (!updatedTeacher) {
      return res
        .status(404)
        .json({ success: false, message: "Teacher not found" });
    }
    res.status(200).json({
      success: true,
      message: "Teacher updated successfully",
      data: updatedTeacher,
    });
  } catch (error) {
    console.error("Error updating teacher:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
