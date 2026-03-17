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

const { authMiddleware, authorize } = require("../middleware/auth");

const router = express.Router();

router.get("/active", getActiveCoupons);
router.get("/code/:code", getCouponByCode);
router.post("/validate", validateCoupon); // Validate is usually public or needs some basic logic

// Auth protected routes
router.post("/apply", authMiddleware, applyCoupon);

// Admin only routes
router.use(authMiddleware);
router.use(authorize("admin"));

router.post("/", createCoupon);
router.get("/", getAllCoupons);
router.get("/:id", getCouponById);
router.put("/:id", updateCoupon);
router.delete("/:id", deleteCoupon);

module.exports = router;
