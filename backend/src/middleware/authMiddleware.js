const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes – require valid JWT
exports.protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      status: 'error',
      message: 'Not authorized. Please log in.'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({ status: 'error', message: 'User no longer exists.' });
    }
    if (!user.isActive) {
      return res.status(401).json({ status: 'error', message: 'Account is disabled.' });
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({
      status: 'error',
      message: err.name === 'JsonWebTokenError' ? 'Invalid token.' : 'Session expired. Please log in again.'
    });
  }
};

// Optional: allow attaching user when token is present, but don't fail if missing
exports.protectOptional = async (req, res, next) => {
  let token;

  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (user && user.isActive) {
      req.user = user;
    }
  } catch (err) {
    // Ignore errors – treat as guest
  }
  next();
};

// Optional: restrict to admin only
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'error',
        message: 'You do not have permission to perform this action.'
      });
    }
    next();
  };
};
