const express = require("express");
const router = express.Router();
const batchController = require("../../controllers/batch/batchController");
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
    if (!file) {
      return next();
    }

    const uploadParams = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: `batches/${Date.now()}-${file.originalname}`,
      Body: file.buffer,
      ContentType: file.mimetype,
    };

    const uploader = new Upload({
      client: s3,
      params: uploadParams,
    });

    const uploadResult = await uploader.done();
    req.body.banner_img_path = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${uploadParams.Key}`;
    next();
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Image upload failed", details: error.message });
  }
};

router.post(
  "/",
  upload.single("banner_img_path"),
  uploadToS3,
  batchController.createBatch
);

router.get("/", batchController.getAllBatches);

router.get("/class/:class", batchController.getBatchesByClass);

router.get("/:id", batchController.getBatchById);

router.put(
  "/:id",
  upload.single("banner_img_path"),
  uploadToS3,
  batchController.updateBatch
);

router.delete("/:id", batchController.deleteBatch);
router.post("/:id/schedule-test", batchController.scheduleTest);
router.put("/:id/schedule-test/:testId", batchController.updateTestSchedule);
router.get("/batch/search-batch", batchController.searchBatch);
router.get("/batch/tests", batchController.getBatchWithTests);

router.get("/category/:categoryName", batchController.getBatchesByCategoryName);
router.get(
  "/category/:categoryName/class/:className",
  batchController.getBatchesByCategoryAndClass
);

module.exports = router;
