const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");
const { protect, protectOptional, restrictTo } = require("../middleware/authMiddleware");
const { productImageUpload } = require("../middleware/uploadMiddleware");

// Get all products with filters
router.get("/", productController.getAllProducts);

// Get featured products
router.get("/featured", productController.getFeaturedProducts);

// Get promotions/sale products
router.get("/promotions", productController.getPromotions);

// Search products
router.get("/search", productController.searchProducts);

// Get filter options (sizes, purposes)
router.get("/filters/options", productController.getFilterOptions);

// Get all products for admin (includes inactive, no pagination limit)
// Staff can view/manage the product catalog, but not delete/restore/purge.
router.get(
  "/admin/all",
  protect,
  restrictTo("admin", "staff"),
  productController.getAdminAllProducts,
);

// Get soft-deleted products — the "trash" (admin only)
router.get(
  "/admin/trash",
  protect,
  restrictTo("admin"),
  productController.getTrashedProducts,
);

// Get single product by ID
router.get("/:id", protectOptional, productController.getProductById);

// Add/update review for a product (logged in users)
router.post("/:id/reviews", protect, productController.addProductReview);

// Upload product image (admin/staff)
router.post(
  "/upload-image",
  protect,
  restrictTo("admin", "staff"),
  productImageUpload.single("image"),
  productController.uploadProductImage,
);

// Create new product (admin/staff)
router.post(
  "/",
  protect,
  restrictTo("admin", "staff"),
  productController.createProduct,
);

// Update product (admin/staff)
router.put(
  "/:id",
  protect,
  restrictTo("admin", "staff"),
  productController.updateProduct,
);

// Restore a soft-deleted product (admin only)
router.patch(
  "/:id/restore",
  protect,
  restrictTo("admin"),
  productController.restoreProduct,
);

// Permanently delete a product already in the trash (admin only)
router.delete(
  "/:id/permanent",
  protect,
  restrictTo("admin"),
  productController.permanentlyDeleteProduct,
);

// Delete product (admin only) — moves it to the trash (soft delete)
router.delete(
  "/:id",
  protect,
  restrictTo("admin"),
  productController.deleteProduct,
);

module.exports = router;
