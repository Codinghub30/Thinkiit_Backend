const Faq = require("../../src/model/faq");

exports.createFAQ = async (req, res) => {
  try {
    let { faqTitle, faqDescription } = req.body;
    if (!faqTitle || !faqDescription) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const newFAQ = new Faq({
        faqTitle,
        faqDescription,
    });

    await newFAQ.save();
    res
      .status(200)
      .json({ success: true, message: "FAQ created successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};

exports.updateFAQ = async (req, res) => {
  try {
    const { id } = req.params;
    const { faqTitle, faqDescription,  } = req.body;
    if (!id) {
      return res
        .status(400)
        .json({ success: false, message: "FAQ ID is required" });
    }
    let updateFields = {};
    if (faqTitle) {
      updateFields.faqTitle = faqTitle;
    }
    if (faqDescription) {
        updateFields.faqDescription = faqDescription;
      } 
    const updatedFAQ = await Faq.findByIdAndUpdate(
      id,
      { $set: updateFields },
      { new: true, runValidators: true }
    );
    if (!updatedFAQ) {
      return res
        .status(404)
        .json({ success: false, message: "FAQ not found" });
    }
    return res.status(200).json({
      success: true,
      message: "FAQ updated successfully",
      FAQ: updatedFAQ,
    });
  } catch (error) {
    console.error("Error updating policy:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};
exports.deleteFAQ = async(req,res)=>{
   try {
    const { id } = req.params;
    const removeFAQ = await Faq.findByIdAndDelete(id);
    if(!removeFAQ){
        return res.status(404).json({success:false,message:"FAQ not found"})
      }
    return res.status(200).json({message:"FAQ deleted successfully"});
   } catch (error) {
    console.error(error)
    return res.status(500).json({ success: false, message: "Internal Server Error" });
   }
}

exports.getFaq = async (req, res) => {
  try {
    const faq = await Faq.find();

    return res.status(200).json({
      success: true,
      data:faq
    });
  
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};