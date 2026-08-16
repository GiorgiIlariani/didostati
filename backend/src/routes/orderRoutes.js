const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { protect, protectOptional, restrictTo } = require('../middleware/authMiddleware');
const { orderLookupLimiter } = require('../middleware/rateLimit');
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
    // checkFalsy: true — an empty string ("") from an optional form field
    // must be treated as "not provided", not as an invalid email.
    .optional({ checkFalsy: true })
    .isEmail().withMessage('Customer email must be valid')
    .normalizeEmail(),
  body('customer.phone')
    .optional()
    .trim()
    .isLength({ max: 50 }).withMessage('Phone number is too long')
];

// Admin: Get all orders
router.get('/admin/all', protect, restrictTo('admin'), orderController.getAllOrders);

// Admin: Get single order
router.get('/admin/:id', protect, restrictTo('admin'), orderController.getAdminOrderById);

// Admin: Update order status
router.patch('/admin/:id/status', protect, restrictTo('admin'), orderController.updateOrderStatus);

// Get user's orders (requires auth)
router.get('/', protect, orderController.getUserOrders);

// Create new order (auth required — guests cannot order)
router.post('/', protect, createOrderValidator, handleValidationErrors, orderController.createOrder);

// Get single order by ID (optional auth - check access).
// Rate-limited: reachable by guests with just the order ID, so it must not
// be brute-forceable to enumerate other customers' orders.
router.get('/:id', orderLookupLimiter, protectOptional, orderController.getOrderById);

module.exports = router;
