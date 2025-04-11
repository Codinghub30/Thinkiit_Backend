const mongoose = require("mongoose");

const classSchema = new mongoose.Schema({
  className: {
    type: String,
    required: true,
    index: true,
  },
});

const classModel = mongoose.model("Class", classSchema);
module.exports = classModel;
