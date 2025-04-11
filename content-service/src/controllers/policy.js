const Policy = require("../../src/model/policy");

exports.createPolicy = async (req, res) => {
  try {
    let { policyTitle, policyDescription } = req.body;
    if (!policyTitle || !policyDescription) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const newPolicy = new Policy({
      policyTitle,
      policyDescription,
    });

    await newPolicy.save();
    res
      .status(200)
      .json({ success: true, message: "Policy created successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};

exports.updatePolicy = async (req, res) => {
  try {
    const { id } = req.params;
    const { policyTitle, policyDescription, index } = req.body;

    if (!id) {
      return res
        .status(400)
        .json({ success: false, message: "Policy ID is required" });
    }
    let updateFields = {};
    if (policyTitle) {
      updateFields.policyTitle = policyTitle;
    }
    if (index !== undefined && policyDescription) {
      const field = `policyDescription.${index}`;
      updateFields[field] = policyDescription;
    }
    const updatedPolicy = await Policy.findByIdAndUpdate(
      id,
      { $set: updateFields },
      { new: true, runValidators: true }
    );
    if (!updatedPolicy) {
      return res
        .status(404)
        .json({ success: false, message: "Policy not found" });
    }
    return res.status(200).json({
      success: true,
      message: "Policy updated successfully",
      policy: updatedPolicy,
    });
  } catch (error) {
    console.error("Error updating policy:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};

exports.deletePolicy = async(req,res)=>{
  try {
    const {id} = req.params;
    const removepolicy = await Policy.findOneAndDelete(id)
    if(!removepolicy){
      return res.status(404).json({success:false,message:"Policy not found"})
    }
    return res.status(200).json({success:true,message:"Policy deleted successfully"})
    
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
}


exports.getPolicy = async (req, res) => {
  try {
    const Policy = await Policy.find();
    return res.status(200).json({
      success: true,
      data:Policy
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};