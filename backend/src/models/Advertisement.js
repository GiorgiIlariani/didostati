const mongoose = require('mongoose');

const advertisementSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Advertisement title is required'],
    trim: true
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  type: {
    type: String,
    enum: ['video', 'image', 'banner'],
    required: true
  },
  mediaUrl: {
    type: String,
    required: [true, 'Media URL is required']
  },
  position: {
    type: String,
    enum: ['hero', 'sidebar-left', 'sidebar-right', 'center', 'footer'],
    default: 'center'
  },
  link: {
    type: String,
    trim: true
  },
  linkText: {
    type: String,
    default: 'Learn More'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  priority: {
    type: Number,
    default: 0
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date
  }
}, {
  timestamps: true
});

// Index for better query performance
advertisementSchema.index({ isActive: 1, position: 1, priority: -1 });

module.exports = mongoose.model('Advertisement', advertisementSchema);
