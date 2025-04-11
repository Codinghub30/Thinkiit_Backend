const Language = require("../../models/language/languages");
const { setCache, getCache, deleteCache } = require("../../utils/cacheService");

exports.createLanguage = async (req, res) => {
  try {
    const { languageName } = req.body;
    const newLanguage = new Language({ languageName });
    await newLanguage.save();

    // Clear cache after creating a new language
    await deleteCache("all_languages");

    res
      .status(201)
      .json({ message: "Language Created", language: newLanguage });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getAllLanguages = async (req, res) => {
  try {
    const cacheKey = "all_languages";

    // Check cache first
    const cachedLanguages = await getCache(cacheKey);
    if (cachedLanguages) {
      console.log(" Serving from cache");
      return res.json(cachedLanguages);
    }

    // Fetch from database if not in cache
    const languages = await Language.find();
    await setCache(cacheKey, languages);

    res.json(languages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getlanguageById = async (req, res) => {
  try {
    const { id } = req.params;
    const cacheKey = `language_${id}`;

    // Check cache first
    const cachedLanguage = await getCache(cacheKey);
    if (cachedLanguage) {
      console.log(" Serving from cache");
      return res.json(cachedLanguage);
    }

    const language = await Language.findById(id);
    if (!language)
      return res.status(404).json({ message: "Language Not Found" });

    // Cache the result
    await setCache(cacheKey, language);

    res.json(language);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateLanguage = async (req, res) => {
  try {
    const { id } = req.params;
    const { languageName } = req.body;

    const updatedLanguage = await Language.findByIdAndUpdate(
      id,
      { languageName },
      { new: true }
    );

    if (!updatedLanguage)
      return res.status(404).json({ message: "Language Not Found" });

    // Clear related caches
    await deleteCache("all_languages");
    await deleteCache(`language_${id}`);

    res.json({ message: "Language Updated", language: updatedLanguage });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteLanguage = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedLanguage = await Language.findByIdAndDelete(id);
    if (!deletedLanguage)
      return res.status(404).json({ message: "Language Not Found" });

    // Clear related caches
    await deleteCache("all_languages");
    await deleteCache(`language_${id}`);

    res.json({ message: "Language Deleted", language: deletedLanguage });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
