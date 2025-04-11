const Institute = require("../models/institute");

// Create a new institute
exports.createInstitute = async (req, res) => {
  try {
    const institute = await Institute.create(req.body);
    res.status(201).json({ success: true, data: institute });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Get all institutes
exports.getInstitutes = async (req, res) => {
  try {
    const institutes = await Institute.find();
    res.status(200).json({ success: true, data: institutes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get institute by ID
exports.getInstituteById = async (req, res) => {
  try {
    const institute = await Institute.findById(req.params.id);
    if (!institute)
      return res
        .status(404)
        .json({ success: false, message: "Institute not found" });
    res.status(200).json({ success: true, data: institute });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update institute
exports.updateInstitute = async (req, res) => {
  try {
    const institute = await Institute.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!institute)
      return res
        .status(404)
        .json({ success: false, message: "Institute not found" });
    res.status(200).json({ success: true, data: institute });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Delete institute
exports.deleteInstitute = async (req, res) => {
  try {
    const institute = await Institute.findByIdAndDelete(req.params.id);
    if (!institute)
      return res
        .status(404)
        .json({ success: false, message: "Institute not found" });
    res
      .status(200)
      .json({ success: true, message: "Institute deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
