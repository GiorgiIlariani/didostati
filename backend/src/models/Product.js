const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: true,
      maxlength: 2000,
    },
  },
  {
    timestamps: true,
  }
);

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'პროდუქტის სახელი აუცილებელია'],
    trim: true,
    maxlength: [200, 'პროდუქტის სახელი 200 სიმბოლოზე მეტი ვერ იქნება']
  },
  description: {
    type: String,
    required: [true, 'პროდუქტის აღწერა აუცილებელია'],
    maxlength: [2000, 'აღწერა 2000 სიმბოლოზე მეტი ვერ იქნება']
  },
  price: {
    type: Number,
    required: [true, 'ფასი აუცილებელია'],
    min: [0, 'ფასი უარყოფითი ვერ იქნება']
  },
  originalPrice: {
    type: Number,
    min: [0, 'ძველი ფასი უარყოფითი ვერ იქნება']
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'კატეგორია აუცილებელია']
  },
  brand: {
    type: String,
    required: [true, 'ბრენდი აუცილებელია']
  },
  images: [{
    url: {
      type: String,
      required: true
    },
    alt: String
  }],
  inStock: {
    type: Boolean,
    default: true
  },
  stock: {
    type: Number,
    required: [true, 'ნაშთის რაოდენობა აუცილებელია'],
    min: [0, 'ნაშთი უარყოფითი ვერ იქნება'],
    default: 0
  },
  manualUrl: {
    type: String,
    trim: true,
  },
  videoUrl: {
    type: String,
    trim: true,
  },
  // Aggregate rating info
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0,
  },
  reviewsCount: {
    type: Number,
    default: 0,
  },
  // Individual reviews
  reviews: [reviewSchema],
  // Social proof tracking
  viewCount: {
    type: Number,
    default: 0,
    min: 0
  },
  soldCount: {
    type: Number,
    default: 0,
    min: 0
  },
  badge: {
    type: String,
    enum: ['New', 'Sale', 'Popular', 'Best Seller', null],
    default: null
  },
  specifications: {
    type: Map,
    of: String
  },
  tags: [String],
  size: {
    type: String,
    trim: true,
    default: null
  },
  purpose: {
    type: String,
    trim: true,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for better query performance
// Full-text search across main fields
productSchema.index({
  name: 'text',
  description: 'text',
  brand: 'text',
  tags: 'text',
});
productSchema.index({ category: 1, price: 1 });
productSchema.index({ inStock: 1, isActive: 1 });
productSchema.index({ size: 1, purpose: 1 });

module.exports = mongoose.model('Product', productSchema);
