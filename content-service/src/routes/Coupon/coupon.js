const express = require("express");
const router = express.Router();
const {
  createCupon,
  getCoupon,
  deleteCoupon,
  updateCoupon,getCouponUsageCount
} = require("../../controllers/Coupon/coupon");

router.post("/create", createCupon);
router.get("/", getCoupon);
router.delete("/:id", deleteCoupon);
router.put("/update/:id", updateCoupon);
router.get("/usagecount/:id",getCouponUsageCount);

module.exports = router;
