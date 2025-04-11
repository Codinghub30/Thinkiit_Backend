const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const multer = require("multer");
const dotenv = require("dotenv");
const { v4: uuidv4 } = require("uuid");
const Question = require("../models/questionBank");

dotenv.config();

// AWS S3 Configuration
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
  },
});

// Multer Configuration for Multiple Images
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// ✅ Upload Question (Supports Multiple Images)
const uploadQuestion = async (req, res) => {
  try {
    const files = req.files; // Multiple images will be here
    if (!files || files.length === 0) {
      return res
        .status(400)
        .json({ message: "At least one image is required" });
    }

    const imageUrls = await Promise.all(
      files.map(async (file) => {
        const fileName = `question_images/${uuidv4()}-${file.originalname}`;
        const uploadParams = {
          Bucket: process.env.AWS_BUCKET_NAME,
          Key: fileName,
          Body: file.buffer,
          ContentType: file.mimetype,
        };

        await s3.send(new PutObjectCommand(uploadParams));

        return `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
      })
    );

    console.log(
      'req.body["Question[English]"]:',
      req.body["Question[English]"]
    );
    console.log(req.body);
    console.log("req.body.Question.English:", req.body.Question.English);
    console.log("req.body.Question.Hindi:", req.body.Question.Hindi);
    console.log("req.body.Question.Gujarath:", req.body.Question.Gujarath);

    console.log("req.body.Options.English:", req.body.Options.English);
    console.log("req.body.Options.Hindi:", req.body.Options.Hindi);

    // ✅ Save Question to MongoDB
    const questionData = new Question({
      QID: req.body.QID,
      Class: req.body.Class,
      Subject: req.body.Subject,
      Type: req.body.Type,
      Chapter: req.body.Chapter,
      Topic: req.body.Topic,
      Difficulty: req.body.Difficulty,
      AppearedIn: req.body.AppearedIn,
      noOfOptions: req.body.noOfOptions,
      Question: {
        English: req.body.Question.English,
        Hindi: req.body.Question.Hindi,
        Gujarati: req.body.Question.Gujarath,
      },
      Options: {
        English: req.body.Options.English,
        Hindi: req.body.Options.Hindi,
        Gujarati: req.body.Options.Gujarati,
      },
      Answer: req.body.Answer,
      SolutionSteps: req.body.SolutionSteps,
      SolutionVideo: req.body.SolutionVideo,
      Images: imageUrls, // Store multiple image URLs
      CreatedAt: new Date().toISOString(),
    });

    await questionData.save(); // Save the question only once

    res.status(200).json({
      success: true,
      message: "Question uploaded successfully",
      data: questionData,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return res.status(500).json({
      success: false,
      message: "Error uploading question",
      error: error.message,
    });
  }
};

// ✅ Allow Multiple Image Uploads (Max 5 Images) - Field Name MUST be "images"
const multipleUpload = upload.array("images", 5);

module.exports = {
  multipleUpload,
  uploadQuestion,
};
