const rateLimit = require('express-rate-limit');

// Stricter limiter for auth routes (login/register)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // limit each IP to 20 requests per window
  message: {
    status: 'error',
    message: 'Too many auth attempts from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// General API limiter – protects against accidental abuse
const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 200, // limit each IP to 200 requests per window
  standardHeaders: true,
  legacyHeaders: false
});

module.exports = {
  authLimiter,
  apiLimiter
};

