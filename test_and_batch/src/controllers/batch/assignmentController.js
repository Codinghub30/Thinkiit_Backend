const Assignment = require("../../models/batch/assignment");
const { S3Client, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const NodeCache = require("node-cache");
require("dotenv").config();

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const cache = new NodeCache({ stdTTL: 600, checkperiod: 120 });

exports.createAssignment = async (req, res) => {
  try {
    const {
      className,
      subjectName,
      chapter,
      topic,
      marks,
      category,
      book_file_path,
    } = req.body;

    if (!className || !subjectName || !chapter || !marks) {
      return res
        .status(400)
        .json({ error: "All required fields must be provided." });
    }
    const assignment = new Assignment({
      className,
      subjectName,
      chapter,
      topic,
      marks,
      category,
      book_file_path,
    });
    const savedAssignment = await assignment.save();
    res
      .status(201)
      .json({ message: "Assignment created successfully", savedAssignment });
  } catch (error) {
    console.error("Error creating assignment:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.getAllAssignments = async (req, res) => {
  try {
    const findAssignment = await Assignment.find().sort({ _id: -1 });

    return res.status(200).json(findAssignment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAssignmentsByClass = async (req, res) => {
  try {
    const className = req.params.className;
    const assignments = await Assignment.find({ className }).sort({
      created_at: -1,
    });
    res.status(200).json({
      count: assignments.length,
      assignments,
    });
  } catch (error) {
    console.error("Error fetching assignments by class:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.getAssignmentsBySubject = async (req, res) => {
  try {
    const subjectName = req.params.subjectName;

    const subjects = await Assignment.find({ subjectName: subjectName }).sort({
      created_at: -1,
    });

    res.status(200).json({
      data: subjects,
    });
  } catch (error) {
    console.error("Error fetching subjects by class:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.getAssignmentsByClassAndSubject = async (req, res) => {
  try {
    const { class: assignmentClass, subject } = req.params;

    if (!assignmentClass || !subject) {
      return res.status(400).json({ error: "Class and Subject are required" });
    }

    let assignments = cache.get(
      `assignments_class_${assignmentClass}_subject_${subject}`
    );

    if (!assignments) {
      assignments = await Assignment.find({ class: assignmentClass, subject });
      cache.set(
        `assignments_class_${assignmentClass}_subject_${subject}`,
        assignments
      );
    }

    res.status(200).json(assignments);
  } catch (error) {
    console.error("Error fetching assignments by class and subject:", error);
    res.status(500).json({ error: error.message });
  }
};

// exports.updateAssignment = async (req, res) => {
//   try {
//     const Id = req.params.Id;
//     const { subjectName, className, chapter, topic, marks } = req.body;
//     let book_file_path = req.body.book_file_path;
//     const existingAssignment = await Assignment.findById(Id);
//     if (!existingAssignment) {
//       return res.status(404).json({ error: "Assignment not found" });
//     }

//     if (req.file) {
//       book_file_path = req.file.location;
//       if (
//         existingAssignment.book_file_path &&
//         existingAssignment.book_file_path !== book_file_path
//       ) {
//         const oldKey = existingAssignment.book_file_path.split(".com/")[1];
//         const deleteParams = {
//           Bucket: process.env.AWS_S3_BUCKET_NAME,
//           Key: oldKey,
//         };

//         try {
//           await s3.send(new DeleteObjectCommand(deleteParams));
//         } catch (s3Error) {
//           console.error("Failed to delete old file from S3:", s3Error.message);
//         }
//       }
//     } else {

//       book_file_path = existingAssignment.book_file_path;
//     }

//     let update = {};
//     if (chapter) update.chapter = chapter;
//     if (topic) update.topic = topic;
//     if (marks) update.marks = marks;
//     if (book_file_path) update.book_file_path = book_file_path;
//     if (subjectName) update.subjectName = subjectName;
//     if (className) update.className = className;

//     const updatedAssignment = await Assignment.findByIdAndUpdate(Id, update, {
//       new: true,
//       runValidators: true,
//     });

//     if (!updatedAssignment) {
//       return res.status(404).json({ error: "Data not found" });
//     }

//     res.status(200).json({
//       message: "Assignment updated successfully",
//       updatedAssignment,
//     });
//   } catch (error) {
//     console.error("Error updating assignment:", error.message);
//     res.status(500).json({
//       error: "Failed to update Assignment",
//       details: error.message,
//     });
//   }
// };

exports.updateAssignment = async (req, res) => {
  try {
    const Id = req.params.Id;
    const { subjectName, className, chapter, topic, marks, category } =
      req.body;
    let book_file_path = req.body.book_file_path;

    // Fetch the existing assignment
    const existingAssignment = await Assignment.findById(Id);
    if (!existingAssignment) {
      return res.status(404).json({ error: "Assignment not found" });
    }

    // Handle file upload to S3
    if (req.file) {
      book_file_path = req.file.location;

      // Delete the old file from S3 if a new file is uploaded
      if (
        existingAssignment.book_file_path &&
        existingAssignment.book_file_path !== book_file_path
      ) {
        const oldKey = existingAssignment.book_file_path.split(".com/")[1];
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
      // Retain the existing file path if no new file is uploaded
      book_file_path = existingAssignment.book_file_path;
    }

    // Prepare the update object dynamically
    let update = {};
    if (chapter) update.chapter = chapter;
    if (topic) update.topic = topic;
    if (marks) update.marks = marks;
    if (book_file_path) update.book_file_path = book_file_path;
    if (subjectName) update.subjectName = subjectName;
    if (className) update.className = className;
    if (category) update.category = category;

    // Update the assignment in the database
    const updatedAssignment = await Assignment.findByIdAndUpdate(Id, update, {
      new: true,
      runValidators: true,
    });

    if (!updatedAssignment) {
      return res.status(404).json({ error: "Data not found" });
    }

    res.status(200).json({
      message: "Assignment updated successfully",
      updatedAssignment,
    });
  } catch (error) {
    console.error("Error updating assignment:", error.message);
    res.status(500).json({
      error: "Failed to update Assignment",
      details: error.message,
    });
  }
};

exports.deleteAssignment = async (req, res) => {
  try {
    const Id = req.params.id;
    const assignment = await Assignment.findById(Id);
    if (!assignment) {
      return res.status(404).json({ error: "Assignment not found" });
    }
    const imageKey = assignment.book_file_path?.split(".com/")[1];
    const deleteParams = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: imageKey,
    };
    try {
      await s3.send(new DeleteObjectCommand(deleteParams));
    } catch (s3Error) {
      console.error("Failed to delete Assignment from S3:", s3Error.message);
    }
    const deletedassignment = await Assignment.findByIdAndDelete(Id);
    if (!deletedassignment) {
      return res.status(404).json({ error: "Assignment not found" });
    }
    res.status(200).json({ message: "Assignment deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to delete Assignment", details: error.message });
  }
};
