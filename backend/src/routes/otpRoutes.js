const express = require('express');
const router = express.Router();
const otpController = require('../controllers/otpController');
const { otpLimiter } = require('../middleware/rateLimit');
const { requireCaptcha } = require('../middleware/captcha');

// Sending an OTP costs an SMS — bot-protected with Turnstile when configured.
router.post('/send', otpLimiter, requireCaptcha, otpController.sendOtp);
router.post('/verify', otpLimiter, otpController.verifyOtp);

module.exports = router;
