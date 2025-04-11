const express = require("express");
const router = express.Router();
const {createFAQ,updateFAQ,deleteFAQ,getFaq}= require("../../src/controllers/faq")

router.post("/faq", createFAQ);
router.put("/faq/:id", updateFAQ);
router.delete("/delete/:id", deleteFAQ);
router.get("/",getFaq)


module.exports = router;
