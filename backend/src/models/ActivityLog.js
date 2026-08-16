const mongoose = require('mongoose');

// Audit trail of admin/staff actions (product changes, role changes, etc.)
// so that if something breaks or disappears, it's clear who did what and when.
const activityLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    userName: {
      type: String,
      default: '',
    },
    userRole: {
      type: String,
      default: '',
    },
    action: {
      type: String,
      required: true,
      enum: [
        'product_create',
        'product_update',
        'product_delete',
        'product_restore',
        'product_permanent_delete',
        'user_role_change',
      ],
    },
    resourceType: {
      type: String,
      required: true,
    },
    resourceId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    // Human-readable snapshot (e.g. product name) — kept even if the
    // resource itself is later permanently removed.
    resourceName: {
      type: String,
      default: '',
    },
    meta: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  },
);

activityLogSchema.index({ createdAt: -1 });
activityLogSchema.index({ resourceType: 1, resourceId: 1 });

module.exports = mongoose.model('ActivityLog', activityLogSchema);
