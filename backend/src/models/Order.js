const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    unique: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  customer: {
    name: {
      type: String,
      required: [true, 'Customer name is required']
    },
    email: {
      type: String,
      required: [true, 'Customer email is required']
    },
    phone: {
      type: String,
      required: [true, 'Customer phone is required']
    }
  },
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    name: String,
    price: Number,
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    subtotal: Number
  }],
  shippingAddress: {
    street: String,
    city: {
      type: String,
      required: [true, 'City is required']
    },
    region: String,
    postalCode: String,
    country: {
      type: String,
      default: 'Georgia'
    }
  },
  totalAmount: {
    type: Number,
    required: true
  },
  deliveryFee: {
    type: Number,
    default: 0
  },
  deliveryType: {
    type: String,
    enum: ['standard', 'express', 'pickup'],
    default: 'standard'
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'ready_to_ship', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  statusHistory: [{
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'processing', 'ready_to_ship', 'shipped', 'delivered', 'cancelled'],
    },
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    note: String,
    at: {
      type: Date,
      default: Date.now,
    },
  }],
  assignedManager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false,
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'bank_transfer'],
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed'],
    default: 'pending'
  },
  notes: String
}, {
  timestamps: true
});

// Generate order number: DID-YYYYMMDD-XXXXXX
orderSchema.pre('validate', function(next) {
  if (!this.orderNumber) {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
    this.orderNumber = `DID-${y}${m}${d}-${random}`;
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema);
