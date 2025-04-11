const express = require("express");
const router = express.Router();
const {createPolicy,updatePolicy,deletePolicy,getPolicy}= require("../../src/controllers/policy")

router.post("/policy", createPolicy);
router.put("/update/:id",updatePolicy);
router.delete("/delete/:id",deletePolicy);
router.get("/", getPolicy);

module.exports = router;
