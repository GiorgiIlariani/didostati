const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

// Get all products with filters
router.get('/', productController.getAllProducts);

// Get featured products
router.get('/featured', productController.getFeaturedProducts);

// Get promotions/sale products
router.get('/promotions', productController.getPromotions);

// Search products
router.get('/search', productController.searchProducts);

// Get single product by ID
router.get('/:id', productController.getProductById);

// Add/update review for a product (logged in users)
router.post('/:id/reviews', protect, productController.addProductReview);

// Create new product (admin only)
router.post('/', protect, restrictTo('admin'), productController.createProduct);

// Update product (admin only)
router.put('/:id', protect, restrictTo('admin'), productController.updateProduct);

// Delete product (admin only)
router.delete('/:id', protect, restrictTo('admin'), productController.deleteProduct);

module.exports = router;
