const express = require("express");
const multer = require("multer");
const { S3Client } = require("@aws-sdk/client-s3");
const { Upload } = require("@aws-sdk/lib-storage");
const router = express.Router();
const {
  createBlog,
  getBlog,
  editBlog,
  deleteBlog,
  toggleBlogStatus,getStatusBlog
} = require("../../controllers/BlogsNewsletter/blog");

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
    if (!file) {
      throw new Error("No file provided");
    }

    const uploadParams = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: `blogs/${Date.now()}-${file.originalname}`,
      Body: file.buffer,
      ContentType: file.mimetype,
    };

    const uploader = new Upload({
      client: s3,
      params: uploadParams,
    });

    const uploadResult = await uploader.done();
    req.body.blogimg = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${uploadParams.Key}`;
    next();
  } catch (error) {
    res
      .status(500)
      .json({ error: "Image upload failed", details: error.message });
  }
};

// Routes
router.post("/add", upload.single("blogimg"), uploadToS3, createBlog);
router.get("/", getBlog);
router.put("/edit/:id", upload.single("blogimg"), uploadToS3, editBlog);
router.delete("/delete/:id", deleteBlog);
router.put("/status/:id", toggleBlogStatus);
router.get("/published", getStatusBlog);

module.exports = router;
