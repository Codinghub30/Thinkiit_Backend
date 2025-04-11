const Category = require("../../models/category/category");
const { setCache, getCache, deleteCache } = require("../../utils/cacheService");

exports.createCategory = async (req, res) => {
  try {
    const { categoryName } = req.body;
    const newCategory = new Category({ categoryName });
    await newCategory.save();

    // Clear cached categories since a new one is added
    await deleteCache("categories");

    res
      .status(201)
      .json({ message: "Category Created", category: newCategory });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getAllCategories = async (req, res) => {
  try {
    // Check if categories are cached
    const cachedCategories = await getCache("categories");
    if (cachedCategories) {
      console.log(" from cache");
      return res.json(JSON.parse(cachedCategories));
    }

    // If not in cache, fetch from MongoDB
    const categories = await Category.find();

    // Store fetched data in Redis with an expiry time (1 hour)
    await setCache("categories", JSON.stringify(categories), 3600);

    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getCategoryById = async (req, res) => {
  try {
    const categoryId = req.params.id;

    // Check Redis cache first
    const cachedCategory = await getCache(`category_${categoryId}`);
    if (cachedCategory) {
      return res.json(JSON.parse(cachedCategory));
    }

    // Fetch from DB if not in cache
    const category = await Category.findById(categoryId);
    if (!category)
      return res.status(404).json({ message: "Category Not Found" });

    // Cache the category for future requests (30 minutes expiry)
    await setCache(`category_${categoryId}`, JSON.stringify(category), 1800);

    res.json(category);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const { categoryName } = req.body;
    const updatedCategory = await Category.findByIdAndUpdate(
      req.params.id,
      { categoryName },
      { new: true }
    );

    if (!updatedCategory)
      return res.status(404).json({ message: "Category Not Found" });

    // Clear the cache for this category and all categories
    await deleteCache(`category_${req.params.id}`);
    await deleteCache("categories");

    res.json({ message: "Category Updated", category: updatedCategory });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const deletedCategory = await Category.findByIdAndDelete(req.params.id);
    if (!deletedCategory)
      return res.status(404).json({ message: "Category Not Found" });

    // Clear the cache for this category and all categories
    await deleteCache(`category_${req.params.id}`);
    await deleteCache("categories");

    res.json({ message: "Category Deleted", category: deletedCategory });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
