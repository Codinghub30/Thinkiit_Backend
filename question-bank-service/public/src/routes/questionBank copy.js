const express = require("express");
const router = express.Router();
const {
  multipleUpload,
  uploadQuestion,
} = require("../controllers/questionBank");

// ✅ Upload Question with Multiple Images (IMPORTANT: Use multipleUpload)
router.post("/upload", multipleUpload, uploadQuestion);

// ✅ Get All Questions with Pagination & Filtering (Optional)

// Export Router
module.exports = router;
