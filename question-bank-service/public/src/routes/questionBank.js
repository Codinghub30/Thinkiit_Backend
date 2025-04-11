const express = require("express");
const router = express.Router();
const questionController = require("../controllers/questionBank");
const multer = require("multer");

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/Questions");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "_" + file.originalname);
  },
});
const upload = multer({ storage: storage });

// Routes
router.post("/questions", upload.any(), questionController.createQuestion);
router.get("/questions", questionController.getAllQuestions);
router.get("/questions/:qid", questionController.getQuestionById);
router.put("/questions/:qid", upload.any(), questionController.updateQuestion);
router.delete("/questions/:qid", questionController.deleteQuestion);
router.get("/question/filter", questionController.getFilteredQuestions);

router.get("/getfilteredquestions", questionController.getFilteredQuestions);
router.get("/questionbyclass",questionController.getQuestionsByClass);
router.get("/questionbysubject",questionController.getQuestionsBySubject);
router.get("/questionbylanguage",questionController.getQuestionsBylanguage);


module.exports = router;
