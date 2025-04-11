const Newsletter = require("../../model/BlogsNewsletter/newsletter");
const { S3Client, DeleteObjectCommand } = require("@aws-sdk/client-s3");

// Configure AWS S3 Client
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});
exports.createNewsletter = async (req, res) => {
  try {
    const { title, description, newsImg } = req.body;
    const newsLetter = new Newsletter({
      title,
      description,
      newsImg,
    });
    const result = await newsLetter.save();
    res
      .status(201)
      .json({ success: true, message: "News created successfully", result });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Servern Error" });
  }
};

exports.getNewsletter = async (req, res) => {
  try {
    const result = await Newsletter.find();
    res
      .status(200)
      .json({ success: true, message: "News fetched successfully", result });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};
exports.editNewsletter = async (req, res) => {
  try {
    const Id = req.params.id;
    const { title, description, newsImg } = req.body;
    console.log(title, description, newsImg);
    const existingNewsletter = await Newsletter.findById(Id);
    if (!existingNewsletter) {
      return res.status(404).json({ error: "Newsletter not found" });
    }

    if (newsImg && existingNewsletter.newsImg !== newsImg) {
      const oldKey = existingNewsletter.newsImg?.split(".com/")[1];
      const deleteParams = {
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: oldKey,
      };

      try {
        await s3.send(new DeleteObjectCommand(deleteParams));
      } catch (s3Error) {
        console.error("Failed to delete old Image from S3:", s3Error.message);
      }
    }

    const updatedNewsletter = await Newsletter.findByIdAndUpdate(
      Id,
      { title, description, newsImg },
      { new: true, runValidators: true }
    );

    if (!updatedNewsletter) {
      return res.status(404).json({ error: "Newsletter not found" });
    }

    res
      .status(200)
      .json({
        message: "Newsletter updated successfully",
        updatedNewsletter: updatedNewsletter,
      });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to update Newsletter", details: error.message });
  }
};


exports.deleteNewsletter = async (req, res) => {
    try {
      const Id = req.params.id;
      const newsLetter = await Newsletter.findById(Id);
      if (!newsLetter) {
        return res.status(404).json({ error: "NewsLetter not found" });
      }
      const imageKey = newsLetter.newsImg?.split(".com/")[1];
      const deleteParams = {
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: imageKey,
      };
      try {
        await s3.send(new DeleteObjectCommand(deleteParams));
      } catch (s3Error) {
        console.error("Failed to delete NewsLetter from S3:", s3Error.message);
      }
      const deletedNewsletter = await Newsletter.findByIdAndDelete(Id);
      if (!deletedNewsletter) {
        return res.status(404).json({ error: "NewsLetter not found" });
      }
      res.status(200).json({ message: "Newsletter deleted successfully" });
    } catch (error) {
      res
        .status(500)
        .json({ error: "Failed to delete Newsletter", details: error.message });
    }
  };
  

  exports.newsLetterStatus = async (req, res) => {
    try {
      const id = req.params.id;
      const newsLetter = await Newsletter.findById(id);
      if (!newsLetter) {
        return res.status(404).json({ error: "NewsLetter not found" });
      }
      newsLetter.isPublished = !newsLetter.isPublished;
      await newsLetter.save();
  
      res.status(200).json({
        message: `News Letter status updated to ${
            newsLetter.isPublished ? "Active" : "Inactive"
        }`,
        newsLetter,
      });
    } catch (error) {
      console.error("Error toggling newsLetter status:", error);
      res.status(500).json({
        error: "Failed to toggle newsLetter status",
        details: error.message,
      });
    }
  };

  exports.getNewsletters = async (req, res) => {
    try {
      const result = await Newsletter.find({ isPublished: true });
      if (result.length === 0) {
        return res.status(404).json({ success: false, message: "No published newsletters found" });
      }
      res.status(200).json({ success: true, message: "Published newsletters fetched successfully", result });
    } catch (error) {
      console.error("Error fetching newsletters:", error);
      return res.status(500).json({ success: false, message: "Internal Server Error", details: error.message });
    }
  };
  

  