const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');
const { registerValidator, loginValidator } = require('../validators/authValidators');
const { authLimiter } = require('../middleware/rateLimit');

// Public (rate limited)
router.post('/register', authLimiter, registerValidator, authController.register);
router.post('/login', authLimiter, loginValidator, authController.login);

// Protected – requires valid JWT
router.get('/me', authMiddleware.protect, authController.getMe);

module.exports = router;
