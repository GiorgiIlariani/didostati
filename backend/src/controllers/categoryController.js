const Category = require('../models/Category');
const Product = require('../models/Product');

// Get all categories (flat list with parent populated for multi-level display)
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true })
      .populate('parent', 'name slug')
      .sort({ parent: 1, name: 1 });

    // Get product count for each category
    const categoriesWithCount = await Promise.all(
      categories.map(async (category) => {
        const productCount = await Product.countDocuments({
          category: category._id,
          isActive: true
        });
        const obj = category.toObject();
        return {
          ...obj,
          productCount,
          isSubcategory: !!obj.parent
        };
      })
    );

    res.json({
      status: 'success',
      data: {
        categories: categoriesWithCount
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Get single category
exports.getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        status: 'error',
        message: 'Category not found'
      });
    }

    // Get product count
    const productCount = await Product.countDocuments({
      category: category._id,
      isActive: true
    });

    res.json({
      status: 'success',
      data: {
        category: {
          ...category.toObject(),
          productCount
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Get category by slug
exports.getCategoryBySlug = async (req, res) => {
  try {
    const category = await Category.findOne({ slug: req.params.slug });

    if (!category) {
      return res.status(404).json({
        status: 'error',
        message: 'Category not found'
      });
    }

    // Get products in this category
    const products = await Product.find({
      category: category._id,
      isActive: true
    }).limit(20);

    res.json({
      status: 'success',
      data: {
        category: category.toObject(),
        products
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};
