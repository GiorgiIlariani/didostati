const crypto = require('crypto');

// Shared JWT secret accessor. Never falls back to a hardcoded/well-known
// string — a known secret would let anyone forge login and OTP tokens.
let cachedDevSecret = null;

function getJwtSecret() {
  if (process.env.JWT_SECRET) return process.env.JWT_SECRET;

  if (process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET environment variable must be set in production');
  }

  if (!cachedDevSecret) {
    cachedDevSecret = crypto.randomBytes(32).toString('hex');
    console.warn(
      '[WARN] JWT_SECRET is not set — using a random, in-memory secret for this dev session. ' +
      'Sessions will be invalidated on restart. Set JWT_SECRET in .env before deploying.'
    );
  }
  return cachedDevSecret;
}

module.exports = { getJwtSecret };
