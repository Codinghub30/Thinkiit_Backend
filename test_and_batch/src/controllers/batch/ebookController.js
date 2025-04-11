const Ebook = require("../../models/batch/ebook");
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

exports.createEbook = async (req, res) => {
  try {
    const { className, subjectName, chapter, topic, book_file_path, category } =
      req.body;

    if (!className || !subjectName || !chapter) {
      return res
        .status(400)
        .json({ error: "All required fields must be provided." });
    }
    const ebook = new Ebook({
      className,
      subjectName,
      chapter,
      topic,
      book_file_path,
      category,
    });
    const savedebook = await ebook.save();
    res.status(201).json({ message: "Ebook created successfully", savedebook });
  } catch (error) {
    console.error("Error creating ebook:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.getEbooks = async (req, res) => {
  try {
    const ebooks = await Ebook.find();
    res.status(200).json(ebooks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getEbooksByClass = async (req, res) => {
  try {
    const className = req.params.className;
    const ebooks = await Ebook.find({ className });
    res.status(200).json(ebooks);
  } catch (error) {
    console.error("Error fetching eBooks by class:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.getEbooksBySubject = async (req, res) => {
  try {
    const subjectName = req.params.subjectName;
    const ebooks = await Ebook.find({ subjectName });
    res.status(200).json(ebooks);
  } catch (error) {
    console.error("Error fetching eBooks by subject:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.getEbooksByClassAndSubject = async (req, res) => {
  try {
    const { class: ebookClass, subject } = req.params;

    if (!ebookClass || !subject) {
      return res.status(400).json({ error: "Class and Subject are required" });
    }

    let ebooks = cache.get(`ebooks_class_${ebookClass}_subject_${subject}`);

    if (!ebooks) {
      ebooks = await Ebook.find({ class: ebookClass, subject });
      cache.set(`ebooks_class_${ebookClass}_subject_${subject}`, ebooks);
    }

    res.status(200).json(ebooks);
  } catch (error) {
    console.error("Error fetching eBooks by class and subject:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.updateBooks = async (req, res) => {
  try {
    const Id = req.params.Id;
    const { subjectName, className, chapter, topic, category } = req.body;
    let book_file_path = req.body.book_file_path;
    const existingebooks = await Ebook.findById(Id);
    if (!existingebooks) {
      return res.status(404).json({ error: "Ebooks not found" });
    }

    if (req.file) {
      book_file_path = req.file.location;
      if (
        existingebooks.book_file_path &&
        existingebooks.book_file_path !== book_file_path
      ) {
        const oldKey = existingebooks.book_file_path.split(".com/")[1];
        const deleteParams = {
          Bucket: process.env.AWS_S3_BUCKET_NAME,
          Key: oldKey,
        };

        try {
          await s3.send(new DeleteObjectCommand(deleteParams));
        } catch (s3Error) {
          console.error("Failed to delete old file from S3:", s3Error.message);
        }
      }
    } else {
      book_file_path = existingebooks.book_file_path;
    }

    let update = {};
    if (chapter) update.chapter = chapter;
    if (topic) update.topic = topic;
    if (book_file_path) update.book_file_path = book_file_path;
    if (subjectName) update.subjectName = subjectName;
    if (className) update.className = className;
    if (category) update.category = category;
    const updatedebooks = await Ebook.findByIdAndUpdate(Id, update, {
      new: true,
      runValidators: true,
    });

    if (!updatedebooks) {
      return res.status(404).json({ error: "Data not found" });
    }

    res.status(200).json({
      message: "Ebook updated successfully",
      updatedebooks,
    });
  } catch (error) {
    console.error("Error updating ebook:", error.message);
    res.status(500).json({
      error: "Failed to update ebook",
      details: error.message,
    });
  }
};

exports.deleteEbooks = async (req, res) => {
  try {
    const Id = req.params.id;
    const ebook = await Ebook.findById(Id);
    if (!ebook) {
      return res.status(404).json({ error: "Ebook not found" });
    }
    const imageKey = ebook.book_file_path?.split(".com/")[1];
    const deleteParams = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: imageKey,
    };
    try {
      await s3.send(new DeleteObjectCommand(deleteParams));
    } catch (s3Error) {
      console.error("Failed to delete ebook from S3:", s3Error.message);
    }
    const deletedebook = await Ebook.findByIdAndDelete(Id);
    if (!deletedebook) {
      return res.status(404).json({ error: "Ebook not found" });
    }
    res.status(200).json({ message: "Ebook deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to delete Ebook", details: error.message });
  }
};
