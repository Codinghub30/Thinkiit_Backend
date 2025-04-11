// routes.js
const express = require("express");
const testTemplateController = require("../../controllers/Test/testTemplate");

const router = express.Router();

// Test Template Routes
router.post("/test-templates", testTemplateController.createTestTemplate);
router.get(
  "/test-templates/all",
  testTemplateController.AllTestTemplatesWithoutPagination
);

router.get(
  "/test-templates/onlyNames",
  testTemplateController.AllTestTemplatesOnlyNames
);
router.get("/test-templates", testTemplateController.getAllTestTemplates);
router.get("/test-templates/:id", testTemplateController.getTestTemplateById);
router.put("/test-templates/:id", testTemplateController.updateTestTemplate);
router.delete("/test-templates/:id", testTemplateController.deleteTestTemplate);

module.exports = router;
