const User = require('../models/User');
const Order = require('../models/Order');
const Product = require('../models/Product');

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

// GET /api/admin/stats — simple dashboard counters (admin only)
exports.getStats = async (req, res) => {
  try {
    const today = startOfToday();

    const [
      totalUsers,
      usersToday,
      totalOrders,
      ordersToday,
      totalProducts,
      revenueAgg,
      revenueTodayAgg,
    ] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      User.countDocuments({ role: 'user', createdAt: { $gte: today } }),
      Order.countDocuments(),
      Order.countDocuments({ createdAt: { $gte: today } }),
      Product.countDocuments(),
      Order.aggregate([
        { $match: { status: { $ne: 'cancelled' } } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } },
      ]),
      Order.aggregate([
        {
          $match: {
            status: { $ne: 'cancelled' },
            createdAt: { $gte: today },
          },
        },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } },
      ]),
    ]);

    res.json({
      status: 'success',
      data: {
        totalUsers,
        usersToday,
        totalOrders,
        ordersToday,
        totalProducts,
        revenueTotal: revenueAgg[0]?.total || 0,
        revenueToday: revenueTodayAgg[0]?.total || 0,
      },
    });
  } catch (err) {
    console.error('Admin stats error:', err);
    res.status(500).json({
      status: 'error',
      message: 'Failed to load admin stats',
    });
  }
};
