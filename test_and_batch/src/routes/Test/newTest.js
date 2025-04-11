const express = require("express");
const router = express.Router();
const testController = require("../../controllers/Test/newTest");
const multer = require("multer");
const storage = multer.memoryStorage(); // or use diskStorage if needed
const upload = multer({ storage });

// Step 1: Create a new test
router.post("/create", testController.createTest);
router.delete("/delete", testController.deleteTest);

// add sections
router.post("/:testId/section", testController.addSectionToTest);

// Edit a section
router.put("/:testId/section/:sectionId", testController.editSection);

// Delete a section
router.delete("/:testId/section/:sectionId", testController.deleteSection);

router.put(
  "/:testId/section/:sectionId/details",
  testController.updateSectionDetails
);

router.put(
  "/:testId/section/:sectionId/questions",
  testController.addQuestionsToSection
);

router.put("/:testId/updateTestMode", testController.updateTheTestMode);


router.get("/", testController.getAllTests);
router.get("/:id", testController.getTestById);
router.get(
  "/getQuestions/:testId/:sectionId",
  testController.GetTheQuestionsBytestAndSectionID
);
router.get("/:testId/get-topics", testController.getTestSectionByTestId);
// routes/testRoutes.js
router.put("/:testId/sections/:sectionId/remove-topic", testController.removeSelectedTopic);
router.post("/:testId/add-question-ids", testController.addQuestionManually);

router.get("/getPickedQuestions/:testId", testController.GetAllQuestionsByTestID);

router.post("/upload-question-excel/:testId", upload.single("file"), testController.HandleExcelUpload);



// New API
router.post("/create-section/:testId", testController.createSection);
router.post("/add-details/:testId", testController.AddSetionDetails);

module.exports = router;
