const express = require("express");
const multer = require("multer");
const { S3Client } = require("@aws-sdk/client-s3");
const { Upload } = require("@aws-sdk/lib-storage");
const router = express.Router();
const {
  addBanner,getBanners,deleteBanner,editBanner,
} = require("../../controllers/StudentBanner/studentbanner");


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
      Key: `banners/${Date.now()}-${file.originalname}`,
      Body: file.buffer,
      ContentType: file.mimetype,
    };


    const uploader = new Upload({
      client: s3,
      params: uploadParams,
    });

    const uploadResult = await uploader.done();
    req.body.bannerImg = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${uploadParams.Key}`;
    next();
  } catch (error) {
    res
      .status(500)
      .json({ error: "Image upload failed", details: error.message });
  }
};

// Routes
router.post("/add", upload.single("bannerImg"), uploadToS3, addBanner);
router.get("/get", getBanners);
router.put("/edit/:id", upload.single("bannerImg"), uploadToS3, editBanner);
// router.get("/:id?", getBanners);
router.delete("/delete/:id", deleteBanner);

module.exports = router;