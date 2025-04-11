const mongoose = require("mongoose");

const testSchema = new mongoose.Schema({
  testId: {
    type: String,
    // required: true,
  },
  testName: {
    type: String,
  },
});

const testPackageSchema = new mongoose.Schema(
  {
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    packageName: {
      type: String,
      required: true,
    },
    packageDescription: {
      type: String,
      required: true,
    },
    discount: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: true,
    },
    // class: {
    //   type: String,
    //   required: true,
    // },
    // examType: {
    //   type: String,
    //   required: true,
    // },
    tests: [testSchema], // Embedded tests array
  },
  { timestamps: true }
);

const TestPackage = mongoose.model("TestPackage", testPackageSchema);
module.exports = TestPackage;
