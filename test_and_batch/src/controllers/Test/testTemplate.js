const TestTemplate = require("../../models/Test/testTemplate");
const { setCache, getCache, deleteCache } = require("../../utils/cacheService");

// Create a test template
exports.createTestTemplate = async (req, res) => {
  try {
    const newTemplate = await TestTemplate.create(req.body);

    // Clear cache for all test templates
    await deleteCache("testTemplates_*");
    await deleteCache("testTemplates_page_*"); // Clear pagination caches too
    await deleteCache("testTemplates_name"); // Clear template names cache

    res.status(201).json({
      success: true,
      message: "Test template created successfully",
      data: newTemplate,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all test templates
exports.AllTestTemplatesWithoutPagination = async (req, res) => {
  try {
    const cacheKey = `testTemplates_*`;

    // Try to get data from Redis cache
    const cachedData = await getCache(cacheKey);
    if (cachedData) {
      return res.status(200).json({
        success: true,
        data: cachedData,
        source: "cache",
      });
    }
    const templates = await TestTemplate.find();
    res.status(200).json({ success: true, data: templates });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.AllTestTemplatesOnlyNames = async (req, res) => {
  try {
    // Fetch only 'templatename' and '_id' from the database
    const templates = await TestTemplate.find().select("templatename _id");

    res.status(200).json({ success: true, data: templates });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all test templates with pagination and caching
exports.getAllTestTemplates = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    console.log("templates2121");
    const cacheKey = `testTemplates_page_${page}_limit_${limit}`;

    // // Try to get data from Redis cache
    // const cachedData = await getCache(cacheKey);
    // if (cachedData) {
    //   return res.status(200).json({
    //     success: true,
    //     data: cachedData,
    //     source: "cache",
    //   });
    // }
    console.log("temp21");
    // Pagination logic
    const skip = (page - 1) * limit;

    // Fetch data from MongoDB
    const templates = await TestTemplate.find().skip(skip).limit(limit);

    const totalCount = await TestTemplate.countDocuments();

    const response = {
      total: totalCount,
      page: page,
      limit: limit,
      totalPages: Math.ceil(totalCount / limit),
      data: templates,
    };

    // Cache the full response in Redis
    await setCache(cacheKey, response, 3600); // Cache for 1 hour

    res.status(200).json({
      success: true,
      data: response,
      source: "database",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// search by template name
exports.searchByTemplate = async (req, res) => {};

// Get a single test template by ID with caching
exports.getTestTemplateById = async (req, res) => {
  try {
    const { id } = req.params;
    const cacheKey = `testTemplate_${id}`;

    // Try to get data from Redis cache
    const cachedData = await getCache(cacheKey);
    if (cachedData) {
      return res.status(200).json({
        success: true,
        data: cachedData,
        source: "cache",
      });
    }

    const template = await TestTemplate.findById(id);
    if (!template) {
      return res
        .status(404)
        .json({ success: false, message: "Template not found" });
    }

    // Cache the template data
    await setCache(cacheKey, template, 3600);

    res.status(200).json({ success: true, data: template, source: "database" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update a test template by ID and clear relevant cache
exports.updateTestTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedTemplate = await TestTemplate.findByIdAndUpdate(id, req.body, {
      new: true,
    });

    if (!updatedTemplate) {
      return res
        .status(404)
        .json({ success: false, message: "Template not found" });
    }

    // Clear cache for all test templates
    await deleteCache("testTemplates_*");

    res.status(200).json({
      success: true,
      message: "Template updated successfully",
      data: updatedTemplate,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Delete a test template by ID and clear relevant cache
exports.deleteTestTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedTemplate = await TestTemplate.findByIdAndDelete(id);

    if (!deletedTemplate) {
      return res
        .status(404)
        .json({ success: false, message: "Template not found" });
    }

    // Clear cache for all test templates
    await deleteCache("testTemplates_*");

    res.status(200).json({
      success: true,
      message: "Template deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
