const express = require("express");
const {
  createtopic,
  bulkCreatetopics,
  getAlltopics,
  gettopicsByChapterId,
  updatetopic,
  deletetopic,
} = require("../controllers/topic");  

const router = express.Router();

router.post("/", createtopic);
router.post("/bulk", bulkCreatetopics);
router.get("/", getAlltopics);
router.get("/chapter/:chapterId", gettopicsByChapterId);
router.put("/:id", updatetopic);
router.delete("/:id", deletetopic);

module.exports = router;
