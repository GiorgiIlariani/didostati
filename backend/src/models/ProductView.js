const mongoose = require("mongoose");

// One row per unique visitor per product. Used so "X ადამიანმა ნახა"
// counts people, not page refreshes or wishlist/admin fetches.
const productViewSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    visitorKey: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  },
);

productViewSchema.index({ product: 1, visitorKey: 1 }, { unique: true });

module.exports = mongoose.model("ProductView", productViewSchema);
