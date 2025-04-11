const express = require("express");
const router = express.Router();
const {
  termsCondition,
  updateTermsconditions,
  removeTermsConditions,
  getTermsConditions
} = require("../../src/controllers/termscondition");

router.post("/create", termsCondition);
router.put("/:id", updateTermsconditions);
router.delete("/:id", removeTermsConditions);
router.get("/", getTermsConditions);

module.exports = router;
