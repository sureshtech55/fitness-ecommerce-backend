const express = require("express");
const router = express.Router();
const {
    createRazorpayOrder,
    createPayment,
    getPaymentDetails,
    getUserPayments,
    verifyPayment,
    refundPayment
} = require("../controllers/payment.controller");
const { authMiddleware, authorize } = require("../../middleware/auth");

router.use(authMiddleware);

router.post("/create-order", createRazorpayOrder);
router.post("/", createPayment);
router.get("/user", getUserPayments);
router.get("/:id", getPaymentDetails);
router.post("/verify", verifyPayment);
router.post("/refund", authorize("admin"), refundPayment);

module.exports = router;
