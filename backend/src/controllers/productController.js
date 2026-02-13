const Product = require('../models/Product');
const Order = require('../models/Order');

// Get all products with filtering, sorting, and pagination
exports.getAllProducts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      category,
      brand,
      minPrice,
      maxPrice,
      inStock,
      sort = '-createdAt'
    } = req.query;

    // Build query
    const query = { isActive: true };
    
    if (category) query.category = category;
    if (brand) query.brand = brand;
    if (inStock !== undefined) query.inStock = inStock === 'true';
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Execute query with pagination
    const products = await Product.find(query)
      .populate('category', 'name slug')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    // Calculate sold counts for today for all products
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const ordersToday = await Order.find({
      createdAt: { $gte: todayStart, $lte: todayEnd },
      status: { $ne: 'cancelled' }
    });

    const soldCountsMap = {};
    ordersToday.forEach(order => {
      order.items.forEach(item => {
        if (item.product) {
          const productId = item.product.toString();
          soldCountsMap[productId] = (soldCountsMap[productId] || 0) + (item.quantity || 0);
        }
      });
    });

    // Attach sold counts to products
    const productsWithSales = products.map(product => {
      const productObj = product.toObject();
      productObj.soldCount = soldCountsMap[product._id.toString()] || 0;
      return productObj;
    });

    // Get total count for pagination
    const count = await Product.countDocuments(query);

    res.json({
      status: 'success',
      data: {
        products: productsWithSales,
        pagination: {
          currentPage: Number(page),
          totalPages: Math.ceil(count / limit),
          totalProducts: count,
          hasMore: page * limit < count
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

// Get featured/best selling products
exports.getFeaturedProducts = async (req, res) => {
  try {
    const { limit = 8 } = req.query;

    const products = await Product.find({
      isActive: true,
      inStock: true,
      badge: { $in: ['Best Seller', 'Popular', 'New'] }
    })
      .populate('category', 'name slug')
      .sort('-rating -reviews')
      .limit(Number(limit));

    // Calculate sold counts for today
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const ordersToday = await Order.find({
      createdAt: { $gte: todayStart, $lte: todayEnd },
      status: { $ne: 'cancelled' }
    });

    const soldCountsMap = {};
    ordersToday.forEach(order => {
      order.items.forEach(item => {
        if (item.product) {
          const productId = item.product.toString();
          soldCountsMap[productId] = (soldCountsMap[productId] || 0) + (item.quantity || 0);
        }
      });
    });

    const productsWithSales = products.map(product => {
      const productObj = product.toObject();
      productObj.soldCount = soldCountsMap[product._id.toString()] || 0;
      return productObj;
    });

    res.json({
      status: 'success',
      data: { products: productsWithSales }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Get promotions/sale products
exports.getPromotions = async (req, res) => {
  try {
    const { limit = 8 } = req.query;

    // Find products with badge: 'Sale' OR originalPrice > price
    const products = await Product.find({
      isActive: true,
      $or: [
        { badge: 'Sale' },
        {
          originalPrice: { $exists: true, $ne: null, $gt: 0 },
          $expr: { $gt: ['$originalPrice', '$price'] }
        }
      ]
    })
      .populate('category', 'name slug')
      .sort('-createdAt')
      .limit(Number(limit));

    // Calculate sold counts for today
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const ordersToday = await Order.find({
      createdAt: { $gte: todayStart, $lte: todayEnd },
      status: { $ne: 'cancelled' }
    });

    const soldCountsMap = {};
    ordersToday.forEach(order => {
      order.items.forEach(item => {
        if (item.product) {
          const productId = item.product.toString();
          soldCountsMap[productId] = (soldCountsMap[productId] || 0) + (item.quantity || 0);
        }
      });
    });

    const productsWithSales = products.map(product => {
      const productObj = product.toObject();
      productObj.soldCount = soldCountsMap[product._id.toString()] || 0;
      return productObj;
    });

    res.json({
      status: 'success',
      data: { products: productsWithSales }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Search products (smart search)
exports.searchProducts = async (req, res) => {
  try {
    const { q, limit = 20 } = req.query;

    if (!q || !q.trim()) {
      return res.status(400).json({
        status: 'error',
        message: 'Search query is required'
      });
    }

    const cleanQuery = q.trim();
    const maxResults = Number(limit) || 20;

    // Primary: text search with relevance score
    let products = await Product.find(
      {
        $text: { $search: cleanQuery },
        isActive: true
      },
      {
        score: { $meta: 'textScore' }
      }
    )
      .sort({ score: { $meta: 'textScore' } })
      .populate('category', 'name slug')
      .limit(maxResults)
      .exec();

    // Fallback: if no results, use case-insensitive partial match on name/brand
    if (products.length === 0) {
      const regex = new RegExp(cleanQuery, 'i');
      products = await Product.find({
        isActive: true,
        $or: [{ name: regex }, { brand: regex }]
      })
        .populate('category', 'name slug')
        .limit(maxResults)
        .exec();
    }

    res.json({
      status: 'success',
      data: {
        products,
        count: products.length
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Get single product
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('category', 'name slug description')
      .populate('reviews.user', 'name');

    if (!product) {
      return res.status(404).json({
        status: 'error',
        message: 'Product not found'
      });
    }

    // Increment view count (async, don't wait)
    Product.findByIdAndUpdate(req.params.id, { $inc: { viewCount: 1 } })
      .catch(err => console.error('Failed to increment view count:', err));

    // Calculate sold count for today
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const ordersToday = await Order.find({
      createdAt: { $gte: todayStart, $lte: todayEnd },
      status: { $ne: 'cancelled' }
    });

    let soldToday = 0;
    ordersToday.forEach(order => {
      order.items.forEach(item => {
        if (item.product && item.product.toString() === req.params.id) {
          soldToday += item.quantity || 0;
        }
      });
    });

    // Update soldCount if different (async, don't wait)
    if (soldToday !== product.soldCount) {
      Product.findByIdAndUpdate(req.params.id, { soldCount: soldToday })
        .catch(err => console.error('Failed to update sold count:', err));
    }

    // Return product with updated counts
    const productObj = product.toObject();
    productObj.viewCount = (product.viewCount || 0) + 1; // Show incremented value
    productObj.soldCount = soldToday; // Show today's sales

    res.json({
      status: 'success',
      data: { product: productObj }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Add or update a review for a product
exports.addProductReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;

    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        message: 'Login required to leave a review',
      });
    }

    if (!rating || !comment) {
      return res.status(400).json({
        status: 'error',
        message: 'Rating and comment are required',
      });
    }

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        status: 'error',
        message: 'Product not found',
      });
    }

    // Check if user already reviewed
    const existingReviewIndex = product.reviews.findIndex(
      (r) => r.user.toString() === req.user._id.toString()
    );

    if (existingReviewIndex > -1) {
      // Update existing review
      product.reviews[existingReviewIndex].rating = Number(rating);
      product.reviews[existingReviewIndex].comment = comment;
    } else {
      // Add new review
      product.reviews.push({
        user: req.user._id,
        name: req.user.name,
        rating: Number(rating),
        comment,
      });
    }

    // Recalculate rating and count
    product.reviewsCount = product.reviews.length;
    if (product.reviewsCount > 0) {
      const avg =
        product.reviews.reduce((sum, r) => sum + r.rating, 0) /
        product.reviewsCount;
      product.rating = Math.round(avg * 10) / 10;
    } else {
      product.rating = 0;
    }

    await product.save();

    res.status(201).json({
      status: 'success',
      data: {
        product,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
};

// Create product (admin)
exports.createProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body);

    res.status(201).json({
      status: 'success',
      data: { product }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// Update product (admin)
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({
        status: 'error',
        message: 'Product not found'
      });
    }

    res.json({
      status: 'success',
      data: { product }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// Delete product (admin)
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({
        status: 'error',
        message: 'Product not found'
      });
    }

    res.json({
      status: 'success',
      message: 'Product deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};
