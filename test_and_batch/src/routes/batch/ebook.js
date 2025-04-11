const express = require("express");
const router = express.Router();
const ebookController = require("../../controllers/batch/ebookController");
const multer = require("multer");
const { S3Client } = require("@aws-sdk/client-s3");
const { Upload } = require("@aws-sdk/lib-storage");

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const storage = multer.memoryStorage();
const upload = multer({ storage });

const uploadToS3 = async (req, res, next) => {
  try {
    const file = req.file;
    if (req.method === "POST" && !file) {
      return res.status(400).json({ error: "File is required for creation" });
    }
    if (!file) {
      return next();
    }
    const uploadParams = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: `ebooks/${Date.now()}-${file.originalname}`,
      Body: file.buffer,
      ContentType: file.mimetype,
    };

    const uploader = new Upload({
      client: s3,
      params: uploadParams,
    });

    const uploadResult = await uploader.done();
    req.body.book_file_path = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${uploadParams.Key}`;
    next();
  } catch (error) {
    res
      .status(500)
      .json({ error: "Image upload failed", details: error.message });
  }
};

router.post(
  "/",
  upload.single("book_file_path"),
  uploadToS3,
  ebookController.createEbook
);
router.get("/", ebookController.getEbooks);
router.get("/:classId", ebookController.getEbooksByClass);
router.get("/subject/:subjectName", ebookController.getEbooksBySubject);
router.put(
  "/:Id",
  upload.single("book_file_path"),
  uploadToS3,
  ebookController.updateBooks
);
router.delete("/:id", ebookController.deleteEbooks);

module.exports = router;
