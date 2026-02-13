const User = require('../models/User');
const Product = require('../models/Product');

// Get current user's wishlist (full products)
exports.getWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('wishlist');

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    res.json({
      status: 'success',
      data: {
        products: user.wishlist || [],
        ids: (user.wishlist || []).map((p) => p._id)
      }
    });
  } catch (error) {
    console.error('Get wishlist error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to load wishlist'
    });
  }
};

// Toggle product in wishlist (add if missing, remove if present)
exports.toggleWishlistItem = async (req, res) => {
  const { productId } = req.params;

  try {
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        status: 'error',
        message: 'Product not found'
      });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    const exists = user.wishlist.some(
      (id) => id.toString() === productId.toString()
    );

    if (exists) {
      user.wishlist = user.wishlist.filter(
        (id) => id.toString() !== productId.toString()
      );
    } else {
      user.wishlist.push(productId);
    }

    await user.save();

    res.json({
      status: 'success',
      data: {
        wishlistIds: user.wishlist,
        isInWishlist: !exists
      }
    });
  } catch (error) {
    console.error('Toggle wishlist error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update wishlist'
    });
  }
};

