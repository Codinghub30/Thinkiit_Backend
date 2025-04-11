const studentBanner = require('../../model/StudentBanner/studentbanner')
const { S3Client, DeleteObjectCommand } = require("@aws-sdk/client-s3");

// Configure AWS S3 Client
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Add a new banner
const addBanner = async (req, res) => {
  try {
    const { bannerImg, promotionName } = req.body;
    const newBanner = new studentBanner({
      bannerImg,
      promotionName,
    });
    await newBanner.save();
    res 
      .status(200)
      .json({ message: "Banner added successfully", banner: newBanner });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to add banner", details: error.message });
  }
};

// Get all banners or a specific banner by ID
const getBanners = async (req, res) => {
  try {
    const bannerId = req.params.id;

    if (bannerId) {
      const banner = await studentBanner.findById(bannerId);
      if (!banner) {
        return res.status(404).json({ error: "Banner not found" });
      }
      return res.status(200).json(banner);
    }

    const banners = await studentBanner.find();
    res.status(200).json(banners);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to retrieve banners", details: error.message });
  }
};

// Edit a banner
const editBanner = async (req, res) => {
  try {
    const bannerId = req.params.id;
    const { bannerImg, promotionName } = req.body;

    // Find the existing banner to get the old S3 image key
    const existingBanner = await BannerModel.findById(bannerId);
    if (!existingBanner) {
      return res.status(404).json({ error: "Banner not found" });
    }

    // If a new banner image is provided, delete the old image from S3
    if (bannerImg && existingBanner.bannerImg !== bannerImg) {
      const oldKey = existingBanner.bannerImg.split(".com/")[1]; // Extract the key from the S3 URL
      const deleteParams = {
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: oldKey,
      };

      try {
        await s3.send(new DeleteObjectCommand(deleteParams));
      } catch (s3Error) {
        console.error("Failed to delete old banner from S3:", s3Error.message);
      }
    }

    // Update the banner in the database
    const updatedBanner = await BannerModel.findByIdAndUpdate(
      bannerId,
      { bannerImg, promotionName },
      { new: true, runValidators: true }
    );

    if (!updatedBanner) {
      return res.status(404).json({ error: "Banner not found" });
    }

    res
      .status(200)
      .json({ message: "Banner updated successfully", banner: updatedBanner });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to update banner", details: error.message });
  }
};

// Delete a banner
const deleteBanner = async (req, res) => {
  try {
    const bannerId = req.params.id;

    // Find the banner to get the S3 image key
    const banner = await BannerModel.findById(bannerId);
    if (!banner) {
      return res.status(404).json({ error: "Banner not found" });
    }

    // Delete the image from S3
    const imageKey = banner.bannerImg.split(".com/")[1]; // Extract the key from the S3 URL
    const deleteParams = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: imageKey,
    };

    try {
      await s3.send(new DeleteObjectCommand(deleteParams));
    } catch (s3Error) {
      console.error("Failed to delete banner from S3:", s3Error.message);
    }

    // Delete the banner from the database
    const deletedBanner = await BannerModel.findByIdAndDelete(bannerId);
    if (!deletedBanner) {
      return res.status(404).json({ error: "Banner not found" });
    }

    res.status(200).json({ message: "Banner deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to delete banner", details: error.message });
  }
};

module.exports = {
  addBanner,
  getBanners,
  editBanner,
  deleteBanner,
};