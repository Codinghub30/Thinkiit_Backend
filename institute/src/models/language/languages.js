const mongoose = require("mongoose");

const languageSchema = new mongoose.Schema({
  languageName: { type: String, required: true, unique: true },
});

module.exports = mongoose.model("language", languageSchema);
