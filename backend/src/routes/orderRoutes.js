const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { protect, protectOptional, restrictTo } = require('../middleware/authMiddleware');
const { body } = require('express-validator');
const { handleValidationErrors } = require('../validators/validationMiddleware');

// Validation rules for creating an order
const createOrderValidator = [
  body('items')
    .isArray({ min: 1 }).withMessage('Order must contain at least one item'),
  body('items.*.productId')
    .trim()
    .notEmpty().withMessage('Product ID is required for each item'),
  body('items.*.quantity')
    .isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('shippingAddress.city')
    .trim()
    .notEmpty().withMessage('Shipping city is required'),
  body('paymentMethod')
    .isIn(['cash', 'card', 'bank_transfer']).withMessage('Invalid payment method'),
  body('customer.name')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Customer name is too long'),
  body('customer.email')
    .optional()
    .isEmail().withMessage('Customer email must be valid')
    .normalizeEmail(),
  body('customer.phone')
    .optional()
    .trim()
    .isLength({ max: 50 }).withMessage('Phone number is too long')
];

// Admin: Get all orders
router.get('/admin/all', protect, restrictTo('admin'), orderController.getAllOrders);

// Admin: Update order status
router.patch('/admin/:id/status', protect, restrictTo('admin'), orderController.updateOrderStatus);

// Get user's orders (requires auth)
router.get('/', protect, orderController.getUserOrders);

// Create new order (optional auth - guests can order too)
router.post('/', protectOptional, createOrderValidator, handleValidationErrors, orderController.createOrder);

// Get single order by ID (optional auth - check access)
router.get('/:id', protectOptional, orderController.getOrderById);

module.exports = router;
