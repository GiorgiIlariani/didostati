const ActivityLog = require('../models/ActivityLog');

/**
 * Record an admin/staff action for the audit trail.
 * Intentionally swallows errors — logging must never break the actual
 * operation it's recording.
 */
async function logActivity({ user, action, resourceType, resourceId, resourceName, meta }) {
  try {
    await ActivityLog.create({
      user: user?._id || null,
      userName: user?.name || '',
      userRole: user?.role || '',
      action,
      resourceType,
      resourceId: resourceId || null,
      resourceName: resourceName || '',
      meta: meta || {},
    });
  } catch (err) {
    console.error('Failed to write activity log:', err.message);
  }
}

module.exports = { logActivity };
