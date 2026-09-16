const express = require('express');
const router = express.Router();
const supportController = require('../controllers/supportController');
const authMiddleware = require('../middleware/authMiddleware');
const { supportFormLimiter } = require('../middleware/rateLimit');

// Public endpoint – users can ask questions without being logged in.
// If logged in and token is present, attach user via protectOptional.
router.post('/', supportFormLimiter, authMiddleware.protectOptional, supportController.createSupportRequest);

// Admin routes
router.get('/admin/all', authMiddleware.protect, authMiddleware.restrictTo('admin'), supportController.getAllSupportRequests);
router.patch('/admin/:id', authMiddleware.protect, authMiddleware.restrictTo('admin'), supportController.updateSupportRequest);

module.exports = router;


