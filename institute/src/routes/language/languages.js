const express = require("express");
const {
  createLanguage,
  getAllLanguages,
  getlanguageById,
  updateLanguage,
  deleteLanguage,
} = require("../../controllers/language/languages");

const router = express.Router();

router.post("/", createLanguage);
router.get("/", getAllLanguages);
router.get("/:id", getlanguageById);
router.put("/:id", updateLanguage);
router.delete("/:id", deleteLanguage);

module.exports = router;
