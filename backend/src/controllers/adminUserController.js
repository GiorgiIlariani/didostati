const User = require('../models/User');
const { logActivity } = require('../services/activityLogService');

const ASSIGNABLE_ROLES = ['user', 'staff', 'admin'];

// GET /api/admin/users — list users (admin only), for promoting/demoting staff
exports.listUsers = async (req, res) => {
  try {
    const { role, q, page = 1, limit = 50 } = req.query;

    const query = {};
    if (role && ASSIGNABLE_ROLES.includes(role)) query.role = role;
    if (q && q.trim()) {
      const regex = new RegExp(q.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      query.$or = [{ name: regex }, { email: regex }, { phone: regex }];
    }

    const [users, count] = await Promise.all([
      User.find(query)
        .select('-password')
        .sort('-createdAt')
        .limit(Number(limit))
        .skip((Number(page) - 1) * Number(limit)),
      User.countDocuments(query),
    ]);

    res.json({
      status: 'success',
      data: {
        users,
        pagination: {
          currentPage: Number(page),
          totalPages: Math.ceil(count / limit),
          totalUsers: count,
        },
      },
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// PATCH /api/admin/users/:id/role — promote/demote a user (admin only)
exports.updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!ASSIGNABLE_ROLES.includes(role)) {
      return res.status(400).json({
        status: 'error',
        message: `როლი უნდა იყოს ერთ-ერთი: ${ASSIGNABLE_ROLES.join(', ')}`,
      });
    }

    if (String(req.params.id) === String(req.user._id)) {
      return res.status(400).json({
        status: 'error',
        message: 'საკუთარი როლის შეცვლა არ შეიძლება',
      });
    }

    const target = await User.findById(req.params.id);
    if (!target) {
      return res.status(404).json({ status: 'error', message: 'მომხმარებელი ვერ მოიძებნა' });
    }

    const previousRole = target.role;
    target.role = role;
    await target.save();

    logActivity({
      user: req.user,
      action: 'user_role_change',
      resourceType: 'User',
      resourceId: target._id,
      resourceName: target.name || target.email || target.phone,
      meta: { previousRole, newRole: role },
    });

    res.json({
      status: 'success',
      message: 'როლი წარმატებით შეიცვალა',
      data: { user: { _id: target._id, name: target.name, email: target.email, role: target.role } },
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};
