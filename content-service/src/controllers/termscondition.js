const TermsCondition = require("../../src/model/termscondition");

exports.termsCondition = async (req, res) => {
  try {
    const { title, description } = req.body;
    if (!title || !description) {
      return res
        .status(400)
        .json({ success: false, message: "Please fill in all fields" });
    }
    const termsCondition = new TermsCondition({ title, description });
    await termsCondition.save();
    return res.status(201).json({
      success: true,
      message: "Terms and Conditions added successfully",
      termsCondition,
    });
  } catch (error) {
    console.error("Error adding Terms and Conditions:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};

exports.updateTermsconditions = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description,index } = req.body;
    let updateFields = {};
    if (title) {
      updateFields.title = title;
    }
    if (index !== undefined && description) {
      const field = `description.${index}`;
      updateFields[field] = description;
    }
    const updatedTerms = await TermsCondition.findByIdAndUpdate(
      id,
      { $set: updateFields },
      { new: true, runValidators: true }
    );
    if (!updatedTerms) {
      return res
        .status(404)
        .json({ success: false, message: "Terms & Conditions not found" });
    }
    return res.status(200).json({
      success: true,
      message: "Terms & Conditions updated successfully",
      TermsConditions: updatedTerms,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};

exports.removeTermsConditions = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedTerms = await TermsCondition.findByIdAndDelete(id);
    if (!deletedTerms) {
      return res
        .status(404)
        .json({ success: false, message: "Terms & Conditions not found" });
    }
    return res.status(200).json({
      success: true,
      message: "Terms & Conditions deleted successfully",
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};

exports.getTermsConditions = async (req, res) => {
  try {
    const termsConditions = await TermsCondition.find();
    return res.status(200).json({
      success: true,
      message: "Terms & Conditions retrieved successfully",
      data:termsConditions
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};
