const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/User');
const { verifyOtpToken, normalizePhone } = require('./otpController');
const { getJwtSecret } = require('../config/jwtSecret');

const signToken = (id) => {
  return jwt.sign(
    { id },
    getJwtSecret(),
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

const userPayload = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email || '',
  phone: user.phone || '',
  role: user.role,
  authProvider: user.authProvider,
});

const sendTokenResponse = (user, statusCode, res) => {
  const token = signToken(user._id);
  res.status(statusCode).json({
    status: 'success',
    data: {
      user: userPayload(user),
      token,
      expiresIn: process.env.JWT_EXPIRE || '7d'
    }
  });
};

// @desc    Register user (email + password)
exports.register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array().map(e => ({ field: e.path, msg: e.msg }))
      });
    }

    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        status: 'error',
        message: 'Email already registered.'
      });
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      authProvider: 'email',
    });
    sendTokenResponse(user, 201, res);
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err.message || 'Registration failed'
    });
  }
};

// @desc    Login user (email + password)
exports.login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array().map(e => ({ field: e.path, msg: e.msg }))
      });
    }

    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid email or password.'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        status: 'error',
        message: 'Account is disabled.'
      });
    }

    user.password = undefined;
    sendTokenResponse(user, 200, res);
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err.message || 'Login failed'
    });
  }
};

/**
 * Phone OTP login / register
 * Body: { phone, code } OR { phone, otpToken } after verify
 * Prefer: { phone, code } — verifies login OTP and returns JWT
 */
exports.loginWithPhone = async (req, res) => {
  try {
    const phone = normalizePhone(req.body.phone);
    if (!phone) {
      return res.status(400).json({
        status: 'error',
        message: 'ვალიდური ქართული ნომერია საჭირო (5XXXXXXXX)',
      });
    }

    let verified = false;

    // otpToken must have been issued for purpose "login" — an "order" OTP
    // (obtained via the checkout flow) must never authenticate a session.
    if (req.body.otpToken) {
      const tokenPhone = verifyOtpToken(req.body.otpToken, 'login');
      verified = tokenPhone === phone;
    }

    if (!verified && req.body.code) {
      // Reuse OTP verify logic inline via jwt after calling verify path
      const crypto = require('crypto');
      const OtpSession = require('../models/OtpSession');
      const code = String(req.body.code || '').trim();
      if (!/^\d{6}$/.test(code)) {
        return res.status(400).json({
          status: 'error',
          message: 'კოდი უნდა იყოს 6 ციფრი',
        });
      }
      const session = await OtpSession.findOne({
        phone,
        purpose: 'login',
        verified: false,
        expiresAt: { $gt: new Date() },
      }).sort('-createdAt');

      if (!session) {
        return res.status(400).json({
          status: 'error',
          message: 'კოდი ვადაგასულია ან არ არსებობს',
        });
      }
      if (session.attempts >= 5) {
        return res.status(429).json({
          status: 'error',
          message: 'ძალიან ბევრი მცდელობა',
        });
      }
      session.attempts += 1;
      const codeHash = crypto.createHash('sha256').update(code).digest('hex');
      if (session.codeHash !== codeHash) {
        await session.save();
        return res.status(400).json({
          status: 'error',
          message: 'არასწორი კოდი',
        });
      }
      session.verified = true;
      await session.save();
      verified = true;
    }

    if (!verified) {
      return res.status(401).json({
        status: 'error',
        message: 'ტელეფონის დადასტურება საჭიროა',
      });
    }

    let user = await User.findOne({ phone });
    if (!user) {
      const name = req.body.name?.trim() || `მომხმარებელი ${phone.slice(-4)}`;
      user = await User.create({
        name,
        phone,
        authProvider: 'phone',
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        status: 'error',
        message: 'ანგარიში გამორთულია',
      });
    }

    sendTokenResponse(user, 200, res);
  } catch (err) {
    console.error('loginWithPhone:', err);
    res.status(500).json({
      status: 'error',
      message: err.message || 'შესვლა ვერ მოხერხდა',
    });
  }
};

/**
 * Google Sign-In
 * Body: { credential } — Google ID token (JWT from GIS)
 */
exports.loginWithGoogle = async (req, res) => {
  try {
    const credential = req.body.credential || req.body.idToken;
    if (!credential) {
      return res.status(400).json({
        status: 'error',
        message: 'Google credential საჭიროა',
      });
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (!clientId) {
      return res.status(503).json({
        status: 'error',
        message: 'Google ავტორიზაცია არ არის კონფიგურირებული (GOOGLE_CLIENT_ID)',
      });
    }

    // Verify ID token via Google tokeninfo
    const verifyUrl = `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`;
    const gRes = await fetch(verifyUrl);
    const payload = await gRes.json();

    if (!gRes.ok || payload.error) {
      return res.status(401).json({
        status: 'error',
        message: 'Google ტოკენი არასწორია',
      });
    }

    if (payload.aud !== clientId) {
      return res.status(401).json({
        status: 'error',
        message: 'Google client ID არ ემთხვევა',
      });
    }

    const googleId = payload.sub;
    // Only trust the email for account linking/lookup when Google has
    // verified it — otherwise an attacker could add an unverified email
    // matching an existing account and take it over via Google Sign-In.
    const emailVerified = payload.email_verified === true || payload.email_verified === 'true';
    const email = emailVerified ? (payload.email || '').toLowerCase() : '';
    const name = payload.name || email.split('@')[0] || 'მომხმარებელი';

    let user = await User.findOne({
      $or: [
        { googleId },
        ...(email ? [{ email }] : []),
      ],
    });

    if (user) {
      if (!user.googleId) {
        user.googleId = googleId;
        user.authProvider = user.authProvider || 'google';
        await user.save();
      }
    } else {
      user = await User.create({
        name,
        email: email || undefined,
        googleId,
        authProvider: 'google',
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        status: 'error',
        message: 'ანგარიში გამორთულია',
      });
    }

    sendTokenResponse(user, 200, res);
  } catch (err) {
    console.error('loginWithGoogle:', err);
    res.status(500).json({
      status: 'error',
      message: err.message || 'Google შესვლა ვერ მოხერხდა',
    });
  }
};

// @desc    Get current user
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json({
      status: 'success',
      data: { user: userPayload(user) }
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err.message || 'Failed to get user'
    });
  }
};
