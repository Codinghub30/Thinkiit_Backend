const multer = require("multer");
const multerS3 = require("multer-s3");
const { S3Client } = require("@aws-sdk/client-s3");
const { v4: uuidv4 } = require("uuid");
require("dotenv").config();

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype.startsWith("image/") ||
    file.mimetype === "application/pdf"
  ) {
    cb(null, true);
  } else {
    cb(new Error(" Only image (JPEG/PNG) and PDF files are allowed"), false);
  }
};

console.log("process.env.AWS_S3_BUCKET_NAME", process.env.AWS_S3_BUCKET_NAME);
const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.AWS_S3_BUCKET_NAME,
    metadata: (req, file, cb) => {
      cb(null, { fieldName: file.fieldname });
    },
    key: (req, file, cb) => {
      console.log("🔹 Uploading File:", file);

      let folder = "uploads/";
      if (file.mimetype.startsWith("image/")) {
        folder = "profile-images/";
      } else if (file.mimetype === "application/pdf") {
        folder = "assignments/";
      }

      cb(null, `${folder}${Date.now()}-${uuidv4()}-${file.originalname}`);
    },
  }),
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

module.exports = upload;
