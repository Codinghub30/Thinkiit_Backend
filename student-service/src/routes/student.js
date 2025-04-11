const express = require("express");
const {
  registerStudent,
  loginStudent,
  getAllStudents,
  getStudentById,
  updatePassword,
  updateStudent,
  bulkRegisterStudents,
  resetStudentPasswords,
  deletestudent,
} = require("../controllers/student");
const authenticate = require("../middlewares/authMiddleware");
const multer = require("multer");
const { S3Client } = require("@aws-sdk/client-s3");
const { Upload } = require("@aws-sdk/lib-storage");

const router = express.Router();

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
    //   if (req.method === "PUT" && !file) {
    //     return res.status(400).json({ error: "File is required for creation" });
    // }
    if (!file) {
      return next();
    }
    const uploadParams = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: `Student/${Date.now()}-${file.originalname}`,
      Body: file.buffer,
      ContentType: file.mimetype,
    };
    const uploader = new Upload({
      client: s3,
      params: uploadParams,
    });

    const uploadResult = await uploader.done();
    req.body.profile_file_path = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${uploadParams.Key}`;
    next();
  } catch (error) {
    res
      .status(500)
      .json({ error: "Image upload failed", details: error.message });
  }
};
// Auth Routes
router.post("/bulk-register", bulkRegisterStudents);
router.post("/register", registerStudent);

router.post("/login", loginStudent);
router.get("/", getAllStudents);
router.get("/:id", authenticate, getStudentById);
router.put("/update-password", authenticate, updatePassword);
router.post("/reset-passwords", resetStudentPasswords);
router.put(
  "/edit/:Id",
  authenticate,
  upload.single("profile_file_path"),
  uploadToS3,
  updateStudent
);
router.delete("/deletestudent", deletestudent);
// User Routes

module.exports = router;
