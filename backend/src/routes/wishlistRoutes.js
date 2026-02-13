const express = require('express');
const router = express.Router();
const wishlistController = require('../controllers/wishlistController');
const authMiddleware = require('../middleware/authMiddleware');

// All wishlist routes require authentication
router.use(authMiddleware.protect);

// GET /api/wishlist - current user's wishlist products
router.get('/', wishlistController.getWishlist);

// POST /api/wishlist/toggle/:productId - add/remove product from wishlist
router.post('/toggle/:productId', wishlistController.toggleWishlistItem);

module.exports = router;

