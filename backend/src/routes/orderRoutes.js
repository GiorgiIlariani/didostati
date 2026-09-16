const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { protect, restrictTo } = require('../middleware/authMiddleware');
const { orderLookupLimiter } = require('../middleware/rateLimit');
const { body } = require('express-validator');
const { handleValidationErrors } = require('../validators/validationMiddleware');

// Validation rules for creating an order
const createOrderValidator = [
  body('items')
    .isArray({ min: 1 }).withMessage('Order must contain at least one item'),
  body('items.*.productId')
    .trim()
    .isMongoId().withMessage('Invalid product ID'),
  body('items.*.quantity')
    .isInt({ min: 1, max: 1000 }).withMessage('Quantity must be at least 1'),
  body('shippingAddress.city')
    .trim()
    .notEmpty().withMessage('Shipping city is required'),
  // How the cart priced delivery: tariff city name and/or GPS coordinates.
  body('deliveryCity')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 100 }).withMessage('Delivery city is too long'),
  body('deliveryCoords.lat')
    .optional()
    .isFloat({ min: -90, max: 90 }).withMessage('Invalid latitude'),
  body('deliveryCoords.lng')
    .optional()
    .isFloat({ min: -180, max: 180 }).withMessage('Invalid longitude'),
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

// Get single order by ID (auth required — only the owner may view it).
// Orders can only be created by logged-in users, so there is no guest case.
// Rate-limited to slow down ID enumeration attempts even by logged-in users.
router.get('/:id', orderLookupLimiter, protect, orderController.getOrderById);

module.exports = router;
