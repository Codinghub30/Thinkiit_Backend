const BlogModel = require("../../model/BlogsNewsletter/blog");
const { S3Client, DeleteObjectCommand } = require("@aws-sdk/client-s3");

// Configure AWS S3 Client
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

exports.createBlog = async (req, res) => {
  try {
    const { title, description, blogimg } = req.body;
    if (!title || !description) {
      return res
        .status(400)
        .json({ message: "Title, description, and author are required" });
    }

    const blog = new BlogModel({
      title,
      description,
      blogimg,
    });

    const savedBlog = await blog.save();
    return res.status(201).json({
      message: "Blog created successfully",
      blog: savedBlog,
    });
  } catch (error) {
    console.error("Error creating blog:", error);
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

exports.getBlog = async (req, res) => {
  try {
    const blogs = await BlogModel.find().sort({ createdAt: -1 });
    return res.status(200).json({
      message: "Blogs fetched successfully",
      blogs,
    });
  } catch (error) {
    console.error("Error fetching blogs:", error);
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

exports.editBlog = async (req, res) => {
  try {
    const Id = req.params.id;
    const { title, description, blogimg } = req.body;

    const existingBanner = await BlogModel.findById(Id);
    if (!existingBanner) {
      return res.status(404).json({ error: "Blog not found" });
    }

    if (blogimg && existingBanner.blogimg !== blogimg) {
      const oldKey = existingBanner.blogimg?.split(".com/")[1];
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

    const updatedBlog = await BlogModel.findByIdAndUpdate(
      Id,
      { blogimg, description, title },
      { new: true, runValidators: true }
    );

    if (!updatedBlog) {
      return res.status(404).json({ error: "Blog not found" });
    }

    res
      .status(200)
      .json({ message: "Blog updated successfully", updatedBlog: updatedBlog });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to update Blog", details: error.message });
  }
};

exports.deleteBlog = async (req, res) => {
  try {
    const Id = req.params.id;
    const blog = await BlogModel.findById(Id);
    if (!blog) {
      return res.status(404).json({ error: "Blogs not found" });
    }

    const imageKey = blog.blogimg?.split(".com/")[1];
    const deleteParams = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: imageKey,
    };
    try {
      await s3.send(new DeleteObjectCommand(deleteParams));
    } catch (s3Error) {
      console.error("Failed to delete blog from S3:", s3Error.message);
    }
    const deletedBlog = await BlogModel.findByIdAndDelete(Id);
    if (!deletedBlog) {
      return res.status(404).json({ error: "Blog not found" });
    }
    res.status(200).json({ message: "Blog deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to delete Blog", details: error.message });
  }
};

exports.toggleBlogStatus = async (req, res) => {
  try {
    const id = req.params.id;
    const blog = await BlogModel.findById(id);
    if (!blog) {
      return res.status(404).json({ error: "Blog not found" });
    }
    blog.isPublished = !blog.isPublished;
    await blog.save();

    res.status(200).json({
      message: `Blog status updated to ${
        blog.isPublished ? "Active" : "Inactive"
      }`,
      blog,
    });
  } catch (error) {
    console.error("Error toggling blog status:", error);
    res.status(500).json({
      error: "Failed to toggle blog status",
      details: error.message,
    });
  }
};

exports.getStatusBlog = async (req, res) => {
  try {
    const result = await BlogModel.find({ isPublished: true });
    if (result.length === 0) {
      return res.status(404).json({ success: false, message: "No published blog found" });
    }
    res.status(200).json({ success: true, message: "Published blog fetched successfully", result });
  } catch (error) {
    console.error("Error fetching blog:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error", details: error.message });
  }
};