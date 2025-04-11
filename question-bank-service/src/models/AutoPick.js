const mongoose = require("mongoose");

const AutoPickedSchema = new mongoose.Schema({
  testId: mongoose.Schema.Types.ObjectId,
  sectionId: mongoose.Schema.Types.ObjectId,
  questions: Object, // { topicName: { questionId: true } }
});

module.exports = mongoose.model("AutoPicked", AutoPickedSchema);
