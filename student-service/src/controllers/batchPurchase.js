const { default: mongoose } = require("mongoose");
const BatchPurchase = require("../models/batchPurchase");
const Student = require("../models/student");

exports.createBatchPurchase = async (req, res) => {
  try {
    const {
      student_id,
      batch_id,
      batch_name,
      price,
      targetyear,
      payment_status,
    } = req.body;
    const student = await Student.findById(student_id);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }
    const batchPurchase = new BatchPurchase({
      student_id,
      batch_id,
      batch_name,
      price,
      targetyear,
      payment_status,
    });

    await batchPurchase.save();

    res.status(201).json({
      message: "Batch purchase created successfully",
      batchPurchase,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

exports.getBatchPurchases = async (req, res) => {
  try {
    const { student_id } = req.body;
    const query = student_id ? { student_id } : {};
    const batchPurchases = await BatchPurchase.find(query).populate(
      "student_id"
    );
    res.status(200).json({
      message: "Batch purchases retrieved successfully",
      data: batchPurchases,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// exports.createmanualyBatchPurchase = async (req, res) => {
//   try {
//     const students = req.body.students;

//     if (!students || students.length === 0) {
//       return res.status(400).json({ message: "No students provided" });
//     }

//     const studentIds = students.map((s) => s.student_id);
//     const existingStudents = await Student.find({ _id: { $in: studentIds } });

//     if (existingStudents.length !== students.length) {
//       return res.status(404).json({ message: "Some students not found" });
//     }

//     await BatchPurchase.insertMany(students);

//     res.status(201).json({ message: "Batch purchase created successfully" });
//   } catch (error) {
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// };

exports.createmanualyBatchPurchase = async (req, res) => {
  try {
    const students = req.body.students;

    if (!students || students.length === 0) {
      return res.status(400).json({ message: "No students provided" });
    }

    const batchPurchases = await BatchPurchase.insertMany(students);

    for (const batch of batchPurchases) {
      await Student.findByIdAndUpdate(batch.student_id, {
        $push: { batches: batch._id },
      });
    }

    res.status(201).json({ message: "Batch purchase created successfully" });
  } catch (error) {
    console.error("Error assigning batch:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getStudentsWithBatches = async (req, res) => {
  try {
    console.log("Registered Models:", mongoose.modelNames());
    const students = await Student.find();
    const batchPurchases = await BatchPurchase.find().populate("student_id");
    const updatedStudents = students.map((student) => {
      const batchPurchase = batchPurchases.find(
        (batch) =>
          batch.student_id &&
          batch.student_id._id.toString() === student._id.toString()
      );
      return {
        ...student._doc,
        batch_name: batchPurchase ? batchPurchase.batch_name : "Not Assigned",
      };
    });

    res.status(200).json({
      message: "Students with batch names retrieved successfully",
      data: updatedStudents,
    });
  } catch (error) {
    console.error(" Error in getStudentsWithBatches:", error);
    res.status(500).json({
      message: "Server error while fetching students with batch names.",
      error: error.message,
    });
  }
};

exports.getBatchbystudentPurchases = async (req, res) => {
  try {
    const { student_id } = req.params;

    if (!student_id) {
      return res.status(400).json({ message: "Student ID is required." });
    }

    const batchPurchases = await BatchPurchase.find({ student_id });

    res.status(200).json({
      message: "Batch purchases retrieved successfully",
      data: batchPurchases,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};
