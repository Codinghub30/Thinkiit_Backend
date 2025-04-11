const express = require("express");
const multer = require("multer");
const { S3Client } = require("@aws-sdk/client-s3");
const { Upload } = require("@aws-sdk/lib-storage");
const router = express.Router();
const {
    createNewsletter,
    getNewsletter,
    editNewsletter,
    deleteNewsletter,
    newsLetterStatus,getNewsletters
} = require("../../controllers/BlogsNewsletter/newsletter");

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
      Key: `newsletter/${Date.now()}-${file.originalname}`,
      Body: file.buffer,
      ContentType: file.mimetype,
    };
    const uploader = new Upload({
      client: s3,
      params: uploadParams,
    });

    const uploadResult = await uploader.done();
    req.body.newsImg = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${uploadParams.Key}`;
    next();
  } catch (error) {
    res
      .status(500)
      .json({ error: "Image upload failed", details: error.message });
  }
};

// Routes
router.post("/add", upload.single("newsImg"), uploadToS3, createNewsletter);
router.get("/", getNewsletter);
router.put("/edit/:id",upload.single("newsImg"), uploadToS3,editNewsletter);
router.delete("/delete/:id",deleteNewsletter);
router.put("/status/:id",newsLetterStatus)
router.get("/published", getNewsletters);



module.exports = router;
