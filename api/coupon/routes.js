const express = require("express");
const {
    createCoupon,
    getAllCoupons,
    getActiveCoupons,
    getCouponById,
    getCouponByCode,
    validateCoupon,
    applyCoupon,
    updateCoupon,
    deleteCoupon,
} = require("../coupon/controller");

const router = express.Router();

router.post("/", createCoupon);
router.get("/", getAllCoupons);
router.get("/active", getActiveCoupons);
router.get("/code/:code", getCouponByCode);
router.get("/:id", getCouponByCode);
router.post("/validate", validateCoupon);
router.post("/apply", applyCoupon);
router.put("/:id", updateCoupon);
router.delete("/:id", deleteCoupon);

module.exports = router;
