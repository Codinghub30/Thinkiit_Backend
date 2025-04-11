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
router.post(
  "/getfilteredquestionswithtopic",
  questionController.getFilteredQuestionsforTest
);

// router.post("/autopickquestions", questionController.autopickquestions);


router.post("/question/auto-pick", questionController.autoPickQuestions);

router.post("/getByIds", questionController.fetchThequestionsWithIDS);


router.post("/bulk-upload", questionController.bulkUploadQuestions);


// New API
router.post(
  "/getchapterByIds",
  questionController.fetchThechapterTopicsWithIDS
);

module.exports = router;
