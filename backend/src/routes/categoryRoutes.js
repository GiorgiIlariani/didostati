const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');

// Get all categories
router.get('/', categoryController.getAllCategories);

// Get category by slug
router.get('/slug/:slug', categoryController.getCategoryBySlug);

// Get single category by ID
router.get('/:id', categoryController.getCategoryById);

module.exports = router;
