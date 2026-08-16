const ActivityLog = require('../models/ActivityLog');

// GET /api/admin/activity-log — audit trail (admin only)
exports.getActivityLog = async (req, res) => {
  try {
    const { page = 1, limit = 50, action, resourceType } = req.query;

    const query = {};
    if (action) query.action = action;
    if (resourceType) query.resourceType = resourceType;

    const [logs, count] = await Promise.all([
      ActivityLog.find(query)
        .sort('-createdAt')
        .limit(Number(limit))
        .skip((Number(page) - 1) * Number(limit)),
      ActivityLog.countDocuments(query),
    ]);

    res.json({
      status: 'success',
      data: {
        logs,
        pagination: {
          currentPage: Number(page),
          totalPages: Math.ceil(count / limit),
          totalLogs: count,
        },
      },
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};
