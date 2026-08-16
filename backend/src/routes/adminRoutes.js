const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('../middleware/authMiddleware');
const adminStatsController = require('../controllers/adminStatsController');
const adminUserController = require('../controllers/adminUserController');
const activityLogController = require('../controllers/activityLogController');

router.get('/stats', protect, restrictTo('admin'), adminStatsController.getStats);

// User management — promote/demote (e.g. grant/revoke the limited "staff" role)
router.get('/users', protect, restrictTo('admin'), adminUserController.listUsers);
router.patch('/users/:id/role', protect, restrictTo('admin'), adminUserController.updateUserRole);

// Audit trail of admin/staff actions
router.get('/activity-log', protect, restrictTo('admin'), activityLogController.getActivityLog);

module.exports = router;
