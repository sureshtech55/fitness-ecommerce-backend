const express = require('express')
const router = express.Router();
const controller = require("../controllers/auth.controller");


router.post('/register',controller.register);
router.post('/login', controller.login);
router.post('/send-otp', controller.sendOtp);
router.post('/verify-otp', controller.verifyOtp);
router.post('/forgot-password', controller.forgotPassword);
router.post('/reset-password', controller.resetPassword);

module.exports = router

