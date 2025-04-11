// routes.js
const express = require("express");

const testController = require("../../controllers/Test/test");

const router = express.Router();

// Test Routes
router.post("/test-section", testController.createTest);
router.get("/test-section/template", testController.getAllTestsWithTemplate);

router.get("/test-section", testController.getAllTests);
router.get("/test-section/:id", testController.getTestById);
router.put("/test-section/:id", testController.updateTest);
router.put(
  "/test-section/:testId/question/:sectionId",
  testController.updateTest1
);

//create a new section
router.post("/test-section/:testId/sections", testController.addSectionToTest);

router.put(
  "/test-section/section/:id",
  testController.update_questions_by_sectionid
);
router.delete("/test-section/:id", testController.deleteTest);
router.delete(
  "/test-section/:testId/sections/:sectionId",
  testController.deleteSection
);

module.exports = router;
