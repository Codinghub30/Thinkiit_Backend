const express = require("express");
const router = express.Router();
const testPackageController = require("../../controllers/Test/testPackage");

//  Create a test package
router.post("/", testPackageController.createTestPackage);

//  Get all test packages
router.get("/", testPackageController.getAllTestPackages);

//  Get a test package by ID
router.get("/:id", testPackageController.getTestPackageById);

//  Get test packages by class
router.get("/class/:className", testPackageController.getTestPackagesByClass);

//  Update a test package
router.put("/:id", testPackageController.updateTestPackage);

//  Delete a test package
router.delete("/:id", testPackageController.deleteTestPackage);

module.exports = router;
