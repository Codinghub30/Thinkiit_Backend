const Batch = require("../../models/batch/batch");

const { S3Client, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const NodeCache = require("node-cache");
require("dotenv").config();

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});
const cache = new NodeCache({ stdTTL: 600, checkperiod: 120 });

exports.createBatch = async (req, res) => {
  try {
    const {
      batch_name,
      batch_year,
      class: batchClass,
      category,
      price,
      language,
      description,
      teachers,
      tests,
      banner_img_path,
      videos,
      assignments,
      ebooks,
      startDate,
      endDate,
    } = req.body;

    if (!batch_name || !batchClass || !category || !price) {
      return res
        .status(400)
        .json({ error: "All required fields must be provided." });
    }

    const parsedTeachers = teachers ? JSON.parse(teachers) : [];
    const parsedTests = tests ? JSON.parse(tests) : [];

    const batch = new Batch({
      batch_name,
      batch_year,
      banner_img_path,
      class: batchClass,
      category,
      price,
      language,
      teachers: parsedTeachers,
      description,
      tests: parsedTests,
      banner_img_path,
      videos,
      assignments,
      ebooks,
      startDate,
      endDate,
    });

    await batch.save();
    cache.del("batches");

    res.status(201).json({ message: "Batch created successfully", batch });
  } catch (error) {
    console.error("Error creating batch:", error);
    res
      .status(500)
      .json({ error: "Internal server error. Please try again later." });
  }
};

exports.getAllBatches = async (req, res) => {
  try {
    // Fetch batches and sort by _id in descending order (latest first)
    const batches = await Batch.find().sort({ _id: -1 });

    res.status(200).json(batches);
  } catch (error) {
    console.error("Error fetching batches:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.getBatchById = async (req, res) => {
  try {
    const batch = await Batch.findById(req.params.id);
    if (!batch) {
      return res.status(404).json({ message: "Batch not found" });
    }
    res.status(200).json(batch);
  } catch (error) {
    console.error(" Error fetching batch by ID:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.getBatchesByClass = async (req, res) => {
  try {
    const { class: batchClass } = req.params;

    if (!batchClass) {
      return res.status(400).json({ error: "Class is required" });
    }

    let batches = cache.get(`batches_class_${batchClass}`);

    if (!batches) {
      batches = await Batch.find({ class: batchClass });
      cache.set(`batches_class_${batchClass}`, batches);
    }

    res.status(200).json(batches);
  } catch (error) {
    console.error("Error fetching batches by class:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.updateBatch = async (req, res) => {
  try {
    const batchId = req.params.id;

    const {
      batch_name,
      batch_year,
      class: batchClass,
      category,
      price,
      language,
      description,
      teachers,
      banner_img_path,
      startDate,
      endDate,
    } = req.body;

    const existingBatch = await Batch.findById(batchId);
    if (!existingBatch) {
      return res.status(404).json({ error: "Batch not found" });
    }

    // Handle banner image update (if provided)
    let updatedBannerImgPath = existingBatch.banner_img_path;
    if (banner_img_path && existingBatch.banner_img_path !== banner_img_path) {
      const oldKey = existingBatch.banner_img_path?.split(".com/")[1];
      const deleteParams = {
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: oldKey,
      };

      try {
        await s3.send(new DeleteObjectCommand(deleteParams));
      } catch (s3Error) {
        console.error("Failed to delete old Image from S3:", s3Error.message);
      }
      updatedBannerImgPath = banner_img_path;
    }

    const updateObj = {
      batch_name: batch_name || existingBatch.batch_name,
      batch_year: batch_year || existingBatch.batch_year,
      banner_img_path: updatedBannerImgPath,
      class: batchClass || existingBatch.class,
      category: category || existingBatch.category,
      price: price || existingBatch.price,
      language: language || existingBatch.language,
      description: description || existingBatch.description,
      startDate: startDate || existingBatch.startDate,
      endDate: startDate || existingBatch.startDate,
    };

    // Only update teachers if provided in the request.
    if (typeof teachers !== "undefined" && teachers.trim() !== "") {
      const parsedTeachers = JSON.parse(teachers);
      if (parsedTeachers.length > 0) {
        updateObj.teachers = parsedTeachers;
      }
    }

    const updatedBatch = await Batch.findByIdAndUpdate(batchId, updateObj, {
      new: true,
      runValidators: true,
    });

    if (!updatedBatch) {
      return res.status(404).json({ error: "Batch not found" });
    }

    res
      .status(200)
      .json({ message: "Batch updated successfully", updatedBatch });
  } catch (error) {
    console.error("Error updating batch:", error);
    res.status(500).json({
      error: "Failed to update Batch",
      details: error.message,
    });
  }
};

exports.deleteBatch = async (req, res) => {
  try {
    const Id = req.params.id;
    console.log(Id, "Batch ID received");

    const batch = await Batch.findById(Id);
    if (!batch) {
      return res.status(404).json({ error: "Batch not found" });
    }

    // Extract image key from banner image path
    let imageKey;
    if (batch.banner_img_path) {
      const parts = batch.banner_img_path.split(".com/");
      imageKey = parts.length > 1 ? parts[1] : null;
    }

    if (imageKey) {
      const deleteParams = {
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: imageKey,
      };

      try {
        const s3Client = new S3Client({ region: process.env.AWS_REGION });
        await s3Client.send(new DeleteObjectCommand(deleteParams));
        console.log("S3 image deleted successfully");
      } catch (s3Error) {
        console.error("Failed to delete Batch image from S3:", s3Error.message);
      }
    } else {
      console.warn("No valid image key found, skipping S3 deletion");
    }

    // Delete batch from database
    const deletedBatch = await Batch.findByIdAndDelete(Id);
    if (!deletedBatch) {
      return res.status(404).json({ error: "Batch not found" });
    }

    res.status(200).json({ message: "Batch deleted successfully" });
  } catch (error) {
    console.error("Error deleting batch:", error.message);
    res
      .status(500)
      .json({ error: "Failed to delete Batch", details: error.message });
  }
};

exports.scheduleTest = async (req, res) => {
  try {
    const batchId = req.params.id;
    const {
      test_id,
      testName,
      startDate,
      resultDate,
      resultTime,
      startTime,
      endTime,
      enddate,
      isLifetime,
    } = req.body;

    const batch = await Batch.findById(batchId);
    if (!batch) {
      return res.status(404).json({ error: "Batch not found" });
    }

    // Add new test to the batch
    batch.tests.push({
      test_id,
      testName,
      startDate,
      resultDate,
      resultTime,
      startTime,
      endTime,
      enddate,
      isLifetime,
    });

    const updatedBatch = await batch.save();

    res
      .status(201)
      .json({ message: "Test scheduled successfully", batch: updatedBatch });
  } catch (error) {
    console.error("Error scheduling test:", error);
    res
      .status(500)
      .json({ error: "Failed to schedule test", details: error.message });
  }
};
exports.updateTestSchedule = async (req, res) => {
  try {
    const { id, testId } = req.params;

    const { startDate, resultDate, startTime, endTime, enddate, resultTime } =
      req.body;

    const batch = await Batch.findById(id);
    if (!batch) {
      return res.status(404).json({ error: "Batch not found" });
    }
    const test = batch.tests.id(testId);
    if (!test) {
      return res.status(404).json({ error: "Test not found" });
    }

    // Update only the fields provided.
    test.startDate = startDate || test.startDate;

    test.startTime = startTime || test.startTime;
    test.endTime = endTime || test.endTime;
    test.enddate = enddate || test.enddate;
    test.resultDate = resultDate || test.resultDate;
    test.resultTime = resultTime || test.resultTime;
    const updatedBatch = await batch.save();

    res.status(200).json({
      message: "Test schedule updated successfully",
      batch: updatedBatch,
    });
  } catch (error) {
    console.error("Error updating test schedule:", error);
    res.status(500).json({
      error: "Failed to update test schedule",
      details: error.message,
    });
  }
};

exports.getBatchWithTests = async (req, res) => {
  try {
    const { batchId, startDate } = req.query; // ✅ Get batchId from query params

    // ✅ Validate batchId before querying MongoDB
    if (!mongoose.Types.ObjectId.isValid(batchId)) {
      return res.status(400).json({ error: "Invalid Batch ID format" });
    }

    // Find batch by ID
    const batch = await Batch.findById(batchId);
    if (!batch) {
      return res.status(404).json({ error: "Batch not found" });
    }

    // ✅ Filter tests by startDate if provided
    let filteredTests = batch.tests;
    if (startDate) {
      filteredTests = batch.tests.filter(
        (test) => test.startDate === startDate
      );
    }

    res.status(200).json({ batch, tests: filteredTests });
  } catch (error) {
    console.error("Error fetching batch:", error);
    res
      .status(500)
      .json({ error: "Failed to fetch batch", details: error.message });
  }
};
exports.searchBatch = async (req, res) => {
  try {
    const { batch_name } = req.query;
    if (!batch_name) {
      return res.status(400).json({ message: "Batch name is required." });
    }
    const searchRegex = new RegExp(batch_name, "i");
    const batches = await Batch.find({
      batch_name: { $regex: searchRegex },
    });
    res.status(200).json(batches);
  } catch (error) {
    res.status(500).json({ message: "Server error.", error: error.message });
  }
};

exports.getBatchesByCategoryName = async (req, res) => {
  try {
    const { categoryName } = req.params;
    const batches = await Batch.find({ category: categoryName });
    if (!batches || batches.length === 0) {
      return res
        .status(404)
        .json({ message: `No batches found for category: ${categoryName}` });
    }

    res.status(200).json(batches);
  } catch (error) {
    console.error("Error fetching batches by category name:", error);
    res.status(500).json({ error: error.message });
  }
};
exports.getBatchesByCategoryAndClass = async (req, res) => {
  try {
    const { categoryName, className } = req.params; // Extract category and class

    console.log("Category received in API:", categoryName);
    console.log("Class Level received in API:", className);

    const batches = await Batch.find({
      category: categoryName,
      class: className,
    });

    if (!batches || batches.length === 0) {
      return res.status(404).json({
        message: `No batches found for ${categoryName} - ${className}`,
      });
    }

    res.status(200).json({ data: batches });
  } catch (error) {
    console.error("Error fetching batches:", error);
    res.status(500).json({ error: error.message });
  }
};
