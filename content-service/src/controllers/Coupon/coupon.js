const Coupon = require("../../model/Coupon/coupon");

exports.createCupon = async (req, res) => {
  try {
    const {
      couponName,
      couponCode,
      description,
      validFrom,
      validTill,
      institute,
    } = req.body;

    if (!couponName || !couponCode || !validFrom || !validTill || !institute) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    const existingCoupon = await Coupon.findOne({
      couponCode: couponCode.toUpperCase(),
    });
    if (existingCoupon) {
      return res
        .status(400)
        .json({ success: false, message: "Coupon code already exists" });
    }
    const newCoupon = new Coupon({
      couponName,
      couponCode: couponCode.toUpperCase(),
      description,
      validFrom,
      validTill,
      institute,
    });
    const savedCoupon = await newCoupon.save();
    return res.status(201).json({
      success: true,
      message: "Coupon created successfully",
      data: savedCoupon,
    });
  } catch (error) {
    console.error("Error creating coupon:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      details: error.message,
    });
  }
};

exports.getCoupon = async (req, res) => {
  try {
    const coupons = await Coupon.find({}).sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      message: "Coupons retrieved successfully",
      data: coupons,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      details: error.message,
    });
  }
};

exports.deleteCoupon = async (req, res) => {
  const id = req.params.id;
  try {
    const coupon = await Coupon.findByIdAndDelete(id);
    return res.status(200).json({
      success: true,
      message: "Coupon deleted successfully",
      data: coupon,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

exports.updateCoupon = async (req, res) => {
  try {
    const id = req.params.id;
    const updateData = req.body;

    const existingCoupon = await Coupon.findById(id);
    if (!existingCoupon) {
      return res
        .status(404)
        .json({ success: false, message: "Coupon not found" });
    }
    if (updateData.couponCode) {
      const duplicateCoupon = await Coupon.findOne({
        couponCode: updateData.couponCode.toUpperCase(),
        _id: { $ne: id },
      });
      if (duplicateCoupon) {
        return res
          .status(400)
          .json({ success: false, message: "Coupon code already exists" });
      }
      updateData.couponCode = updateData.couponCode.toUpperCase();
    }
    const updatedCoupon = await Coupon.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    return res.status(200).json({
      success: true,
      message: "Coupon updated successfully",
      data: updatedCoupon,
    });
  } catch (error) {
    console.error("Error updating coupon:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      details: error.message,
    });
  }
};

exports.getCouponUsageCount = async (req, res) => {
  try {
    const id = req.params.id;
    const coupon = await Coupon.findById(id).select("usageCount");
    if (!coupon) {
      return res
        .status(404)
        .json({ success: false, message: "Coupon not found" });
    }
    return res.status(200).json({
      success: true,
      message: "Coupon usage count retrieved successfully",
      usageCount: coupon.usageCount,
    });
  } catch (error) {
    console.error("Error fetching coupon usage count:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      details: error.message,
    });
  }
};
