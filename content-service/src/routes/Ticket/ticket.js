const express = require("express");
const router = express.Router();
const multer = require("multer");
const {
  createTicket,
  resolveTicket,
  updateTicketStatus,
  getOverdueTickets,
  getResolvedTickets,
  getAllticket,
  getStudentTickets
} = require("../../controllers/Ticket/ticket");
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
      throw new Error("No file provided");
    }

    const uploadParams = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: `tickets/${Date.now()}-${file.originalname}`,
      Body: file.buffer,
      ContentType: file.mimetype,
    };

    const uploader = new Upload({
      client: s3,
      params: uploadParams,
    });

    const uploadResult = await uploader.done();
    req.body.resolutionFile = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${uploadParams.Key}`;
    next();
  } catch (error) {
    res
      .status(500)
      .json({ error: "Image upload failed", details: error.message });
  }
};

router.post("/create", createTicket);
router.put(
  "/resolve/:id",
  upload.single("resolutionFile"),
  uploadToS3,
  resolveTicket
);
router.put("/update-status/:id", updateTicketStatus);
router.get("/overdue", getOverdueTickets);
router.get("/resolvedtickets", getResolvedTickets);
router.get("/", getAllticket);
router.get("/:studentId", getStudentTickets);

module.exports = router;
