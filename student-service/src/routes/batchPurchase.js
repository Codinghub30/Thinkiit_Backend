const express = require("express");
const router = express.Router();
const {
  createBatchPurchase,
  getBatchPurchases,
  createmanualyBatchPurchase,
  getStudentsWithBatches,
  getBatchbystudentPurchases,
} = require("../controllers/batchPurchase");

router.post("/create", createBatchPurchase);
router.get("/batch-purchases/:id", getBatchPurchases);
router.post("/create-manualy-batch", createmanualyBatchPurchase);
router.get("/students-with-batches", getStudentsWithBatches);
router.get("/batchpurchasesstudent/:student_id", getBatchbystudentPurchases);

module.exports = router;
