const StudentProfile = require("../models/student");
const Mybatches = require("../models/batchPurchase");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const { S3Client, DeleteObjectCommand } = require("@aws-sdk/client-s3");

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

exports.registerStudent = async (req, res) => {
  try {
    const {
      student_name,
      email_id,
      student_phone_no,
      student_wts_app_no,
      institute_name,
      password,
      profile_file_path,
      studentClass,
      board,
      city,
      country,
      gender,
      parent_phone_no,
      parent_wts_app_no,
      state,
      userId,
    } = req.body;

    const existingStudent = await StudentProfile.findOne({ email_id });
    if (existingStudent) {
      return res.status(400).json({ message: "Email already registered." });
    }
    const existingPhoneNumber = await StudentProfile.findOne({
      student_phone_no,
    });
    if (existingPhoneNumber) {
      return res
        .status(400)
        .json({ message: "Phone number already registered." });
    }

    const lastStudentRollNumber = await StudentProfile.findOne().sort({
      created_at: -1,
    });
    let roll_no = "001";

    if (lastStudentRollNumber) {
      const lastRollNumber = parseInt(lastStudentRollNumber.roll_no);
      roll_no = `${String(lastRollNumber + 1).padStart(3, "0")}`;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newStudent = new StudentProfile({
      student_name,
      email_id,
      student_phone_no,
      student_wts_app_no,
      institute_name,
      password: hashedPassword,
      profile_file_path,
      roll_no,
      studentClass,
      board,
      city,
      country,
      gender,
      parent_phone_no,
      parent_wts_app_no,
      state,
      userId,
    });

    await newStudent.save();

    res.status(201).json({
      message: "Student registered successfully.",
      newStudent,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error.", error: error.message });
  }
};

// Working Condition
exports.bulkRegisterStudents = async (req, res) => {
  try {
    const { students, instituteId } = req.body;
    if (!students || students.length === 0) {
      return res.status(400).json({ message: "No students provided." });
    }

    const newStudents = [];
    const duplicateStudents = [];

    for (let student of students) {
      const { student_name, email_id, student_phone_no, userId } = student;

      const existingUser = await StudentProfile.findOne({ userId });
      if (existingUser) {
        duplicateStudents.push(userId);
        continue;
      }

      const randomPassword = Math.floor(1000 + Math.random() * 9000).toString();

      let roll_no = "001";
      const lastStudent = await StudentProfile.findOne().sort({
        createdAt: -1,
      });
      if (lastStudent && lastStudent.roll_no) {
        const lastRollNumber = parseInt(lastStudent.roll_no);
        roll_no = `${String(lastRollNumber + 1).padStart(3, "0")}`;
      }

      newStudents.push({
        student_name,
        email_id,
        student_phone_no,
        password: randomPassword,
        roll_no,
        userId,
        instituteId,
        student_active_status: true,
      });
    }

    // ✅ Insert new students
    let insertedStudents = [];
    if (newStudents.length > 0) {
      try {
        insertedStudents = await StudentProfile.insertMany(newStudents);
      } catch (dbError) {
        console.error("Error inserting students:", dbError);
        return res.status(500).json({
          message: "Error inserting students into database.",
          error: dbError.message,
        });
      }
    }

    // ✅ Send response
    return res.status(201).json({
      message: "Bulk student registration successful.",

      students: insertedStudents,
    });
  } catch (error) {
    console.error("Server Error:", error);
    return res.status(500).json({
      message: "Internal server error.",
      error: error.message,
    });
  }
};

exports.resetStudentPasswords = async (req, res) => {
  try {
    const { studentIds } = req.body;

    if (!studentIds || studentIds.length === 0) {
      return res.status(400).json({ message: "No students selected." });
    }

    const existingStudents = await StudentProfile.find(
      { _id: { $in: studentIds } },
      { password: 1 }
    );

    const existingPasswords = new Set(existingStudents.map((s) => s.password));
    const updatedStudents = [];

    for (const id of studentIds) {
      let newPassword;

      do {
        newPassword = Math.floor(1000 + Math.random() * 9000).toString();
      } while (existingPasswords.has(newPassword));

      existingPasswords.add(newPassword);

      await StudentProfile.findByIdAndUpdate(id, { password: newPassword });

      updatedStudents.push({ id, newPassword });
    }

    res.status(200).json({
      message: "Passwords reset successfully.",
      updatedStudents,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error.", error: error.message });
  }
};

// exports.loginStudent = async (req, res) => {
//   try {
//     const { email_id, password } = req.body;
//     const student = await StudentProfile.findOne({ email_id });
//     if (!student) {
//       return res.status(400).json({ message: "Invalid email or password." });
//     }
//     const isMatch = await bcrypt.compare(password, student.password);
//     if (!isMatch) {
//       return res.status(400).json({ message: "Invalid password." });
//     }
//     const token = jwt.sign(
//       { id: student._id, email: student.email_id },
//       process.env.JWT_SECRET,
//       { expiresIn: "2d" }
//     );

//     res.status(200).json({ message: "Login successful.", token, student });
//   } catch (error) {
//     res.status(500).json({ message: "Server error.", error: error.message });
//   }
// };

exports.loginStudent = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    console.log("Login Attempt:", { identifier, password });

    if (!identifier || !password) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const student = await StudentProfile.findOne({
      $or: [
        { userId: identifier },
        { email_id: identifier },
        {
          student_phone_no: isNaN(identifier) ? undefined : Number(identifier),
        },
      ].filter(Boolean),
    });

    console.log("Found Student:", student);

    if (!student) {
      return res.status(400).json({ message: "Invalid credentials." });
    }

    const isMatch = password === student.password;

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password." });
    }

    const token = jwt.sign(
      { id: student._id, email: student.email_id, userId: student.userId },
      process.env.JWT_SECRET,
      { expiresIn: "2d" }
    );

    res.status(200).json({
      message: "Login successful.",
      token,
      student,
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Server error.", error: error.message });
  }
};

exports.getAllStudents = async (req, res) => {
  try {
    const students = await StudentProfile.find().populate({
      path: "batches",
      model: "BatchPurchase",
      select: "batch_name",
    });

    res.status(200).json(students);
  } catch (error) {
    res.status(500).json({ message: "Server error.", error: error.message });
  }
};

exports.getStudentById = async (req, res) => {
  try {
    const { id } = req.params;
    const student = await StudentProfile.findById(id);
    if (!student) {
      return res.status(404).json({ message: "Student not found." });
    }
    res.status(200).json(student);
  } catch (error) {
    res.status(500).json({ message: "Server error.", error: error.message });
  }
};

exports.updatePassword = async (req, res) => {
  try {
    const { email_id, oldPassword, newPassword } = req.body;
    const student = await StudentProfile.findOne({ email_id });
    if (!student) {
      return res.status(404).json({ message: "Student not found." });
    }
    const isMatch = await bcrypt.compare(oldPassword, student.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Old password is incorrect." });
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    student.password = hashedPassword;
    await student.save();
    res.status(200).json({ message: "Password updated successfully." });
  } catch (error) {
    res.status(500).json({ message: "Server error.", error: error.message });
  }
};

exports.updateStudent = async (req, res) => {
  try {
    const Id = req.params.Id;
    const {
      student_name,
      email_id,
      student_phone_no,
      student_wts_app_no,
      institute_name,
      studentClass,
      board,
      city,
      country,
      gender,
      parent_phone_no,
      parent_wts_app_no,
      state,
    } = req.body;
    let profile_file_path = req.body.profile_file_path;

    const existingStudent = await StudentProfile.findById(Id);
    if (!existingStudent) {
      return res.status(404).json({ error: "Student not found" });
    }

    if (req.file) {
      profile_file_path = req.file.location;

      if (
        existingStudent.profile_file_path &&
        existingStudent.profile_file_path !== profile_file_path
      ) {
        const oldKey = existingStudent.profile_file_path.split(".com/")[1];
        if (oldKey) {
          const deleteParams = {
            Bucket: process.env.AWS_S3_BUCKET_NAME,
            Key: oldKey,
          };

          try {
            await s3.send(new DeleteObjectCommand(deleteParams));
            console.log("Old file deleted successfully from S3");
          } catch (s3Error) {
            console.error(
              "Failed to delete old file from S3:",
              s3Error.message
            );
          }
        }
      }
    } else {
      profile_file_path = existingStudent.profile_file_path;
    }
    let update = {};
    if (student_name) update.student_name = student_name;
    if (email_id) update.email_id = email_id;
    if (student_phone_no) update.student_phone_no = student_phone_no;
    if (student_wts_app_no) update.student_wts_app_no = student_wts_app_no;
    if (institute_name) update.institute_name = institute_name;
    if (studentClass) update.studentClass = studentClass;
    if (board) update.board = board;
    if (city) update.city = city;
    if (country) update.country = country;
    if (gender) update.gender = gender;
    if (parent_phone_no) update.parent_phone_no = parent_phone_no;
    if (parent_wts_app_no) update.parent_wts_app_no = parent_wts_app_no;
    if (state) update.state = state;
    if (profile_file_path) update.profile_file_path = profile_file_path;

    const updatedStudent = await StudentProfile.findByIdAndUpdate(Id, update, {
      new: true,
      runValidators: true,
    });

    if (!updatedStudent) {
      return res.status(404).json({ error: "Data not found" });
    }

    res.status(200).json({
      message: "Student updated successfully",
      updatedStudent,
    });
  } catch (error) {
    console.error("Error updating Student:", error.message);
    res.status(500).json({
      error: "Failed to update Student",
      details: error.message,
    });
  }
};

exports.deletestudent = async (req, res) => {
  try {
    const { studentIds } = req.body;
    if (!studentIds || studentIds.length === 0) {
      return res.status(400).json({ message: "No student IDs provided" });
    }

    await StudentProfile.deleteMany({ _id: { $in: studentIds } });

    res.status(200).json({
      message: "Students deleted successfully",
      deletedIds: studentIds,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting students", error: error.message });
  }
};
