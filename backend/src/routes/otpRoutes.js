const express = require('express');
const router = express.Router();
const otpController = require('../controllers/otpController');
const { otpLimiter } = require('../middleware/rateLimit');

router.post('/send', otpLimiter, otpController.sendOtp);
router.post('/verify', otpLimiter, otpController.verifyOtp);

module.exports = router;
