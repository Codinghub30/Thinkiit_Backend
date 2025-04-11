const TestPackage = require("../../models/Test/testPackage");

// 📌 Create a new test package
exports.createTestPackage = async (req, res) => {
  try {
    const newPackage = new TestPackage(req.body);
    await newPackage.save();
    res
      .status(201)
      .json({
        success: true,
        message: "Test Package created successfully",
        data: newPackage,
      });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 📌 Get all test packages
exports.getAllTestPackages = async (req, res) => {
  try {
    const packages = await TestPackage.find();
    res.status(200).json({ success: true, data: packages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 📌 Get a test package by ID
exports.getTestPackageById = async (req, res) => {
  try {
    const testPackage = await TestPackage.findById(req.params.id);
    if (!testPackage) {
      return res
        .status(404)
        .json({ success: false, message: "Test Package not found" });
    }
    res.status(200).json({ success: true, data: testPackage });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 📌 Get test packages by class
exports.getTestPackagesByClass = async (req, res) => {
  try {
    const { className } = req.params;
    const packages = await TestPackage.find({ class: className });

    if (!packages.length) {
      return res
        .status(404)
        .json({
          success: false,
          message: "No test packages found for this class",
        });
    }

    res.status(200).json({ success: true, data: packages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 📌 Update a test package
exports.updateTestPackage = async (req, res) => {
  try {
    const updatedPackage = await TestPackage.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!updatedPackage) {
      return res
        .status(404)
        .json({ success: false, message: "Test Package not found" });
    }

    res
      .status(200)
      .json({
        success: true,
        message: "Test Package updated successfully",
        data: updatedPackage,
      });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 📌 Delete a test package
exports.deleteTestPackage = async (req, res) => {
  try {
    const deletedPackage = await TestPackage.findByIdAndDelete(req.params.id);
    if (!deletedPackage) {
      return res
        .status(404)
        .json({ success: false, message: "Test Package not found" });
    }

    res
      .status(200)
      .json({ success: true, message: "Test Package deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
