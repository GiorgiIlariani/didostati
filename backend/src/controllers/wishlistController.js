const mongoose = require("mongoose");
const User = require("../models/User");
const Product = require("../models/Product");

// Get current user's wishlist (full products)
exports.getWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("wishlist");

    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    const rawList = user.wishlist || [];
    // Only keep refs that populated to real products (filter out deleted products)
    const existingProducts = rawList.filter(
      (p) => p && typeof p === "object" && p._id && p.name != null
    );
    const uniqueIds = [
      ...new Set(existingProducts.map((p) => p._id.toString())),
    ];
    const uniqueProducts = existingProducts.filter(
      (p, i, arr) =>
        arr.findIndex((x) => x._id.toString() === p._id.toString()) === i
    );

    // Persist cleaned list so we don't keep stale refs
    if (uniqueIds.length !== rawList.length) {
      user.wishlist = uniqueProducts.map((p) => p._id);
      await user.save();
    }

    res.json({
      status: "success",
      data: {
        products: uniqueProducts,
        ids: uniqueIds,
      },
    });
  } catch (error) {
    console.error("Get wishlist error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to load wishlist",
    });
  }
};

// Toggle product in wishlist (add if missing, remove if present)
exports.toggleWishlistItem = async (req, res) => {
  const { productId } = req.params;

  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    const product = await Product.findById(productId);
    const exists = user.wishlist.some(
      (id) => id.toString() === productId.toString(),
    );

    if (exists) {
      user.wishlist = user.wishlist.filter(
        (id) => id.toString() !== productId.toString(),
      );
    } else {
      if (!product) {
        return res.status(404).json({
          status: "error",
          message: "Product not found",
        });
      }
      user.wishlist.push(productId);
    }

    // Deduplicate wishlist (in case of legacy duplicates)
    user.wishlist = [...new Set(user.wishlist.map((id) => id.toString()))].map(
      (id) => new mongoose.Types.ObjectId(id),
    );
    await user.save();

    const ids = (user.wishlist || []).map((id) => id.toString());

    res.json({
      status: "success",
      data: {
        wishlistIds: ids,
        isInWishlist: !exists,
      },
    });
  } catch (error) {
    console.error("Toggle wishlist error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to update wishlist",
    });
  }
};
