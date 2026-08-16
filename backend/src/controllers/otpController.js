const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const OtpSession = require('../models/OtpSession');
const OtpDailyLimit = require('../models/OtpDailyLimit');
const { sendSms } = require('../services/smsService');
const { getJwtSecret } = require('../config/jwtSecret');

const OTP_TTL_MS = 5 * 60 * 1000; // 5 minutes
const OTP_TOKEN_TTL = '10m';
const MAX_ATTEMPTS = 5;
const RESEND_COOLDOWN_MS = 60 * 1000;
// Anti-abuse: caps how many SMS a single phone number can trigger per day,
// regardless of IP (the IP-based otpLimiter alone isn't enough since one
// phone could be targeted from many IPs, or one IP could hold many phones).
const MAX_OTP_PER_DAY = 5;

/**
 * Atomically increments (and checks) the daily OTP-send counter for a
 * phone number. Returns true if the send is still within the daily limit.
 */
async function checkAndIncrementDailyOtpLimit(phone) {
  const day = new Date().toISOString().slice(0, 10); // YYYY-MM-DD (UTC)
  const windowKey = `${phone}:${day}`;
  const expiresAt = new Date(Date.now() + 26 * 60 * 60 * 1000); // buffer past day boundary
  const doc = await OtpDailyLimit.findOneAndUpdate(
    { windowKey },
    { $inc: { count: 1 }, $setOnInsert: { phone, expiresAt } },
    { upsert: true, new: true }
  );
  return doc.count <= MAX_OTP_PER_DAY;
}

function normalizePhone(raw) {
  if (!raw || typeof raw !== 'string') return null;
  const digits = raw.replace(/\D/g, '');
  // Georgian mobile: 5XXXXXXXX or 9955XXXXXXXX
  if (/^5\d{8}$/.test(digits)) return digits;
  if (/^9955\d{8}$/.test(digits)) return digits.slice(3);
  return null;
}

function hashCode(code) {
  return crypto.createHash('sha256').update(String(code)).digest('hex');
}

function generateCode() {
  // crypto.randomInt is CSPRNG-backed, unlike Math.random() — important
  // since OTP codes gate login/order authentication.
  return String(crypto.randomInt(100000, 1000000));
}

exports.sendOtp = async (req, res) => {
  try {
    const phone = normalizePhone(req.body.phone);
    if (!phone) {
      return res.status(400).json({
        status: 'error',
        message: 'ვალიდური ქართული მობილურის ნომერია საჭირო (5XXXXXXXX)',
      });
    }

    const purpose = req.body.purpose === 'login' ? 'login' : 'order';

    const recent = await OtpSession.findOne({
      phone,
      purpose,
      verified: false,
      createdAt: { $gte: new Date(Date.now() - RESEND_COOLDOWN_MS) },
    }).sort('-createdAt');

    if (recent) {
      const waitSec = Math.ceil(
        (RESEND_COOLDOWN_MS - (Date.now() - recent.createdAt.getTime())) / 1000
      );
      return res.status(429).json({
        status: 'error',
        message: `გთხოვთ დაელოდოთ ${waitSec} წამს ხელახლა გაგზავნამდე`,
        data: { retryAfterSeconds: waitSec },
      });
    }

    const withinDailyLimit = await checkAndIncrementDailyOtpLimit(phone);
    if (!withinDailyLimit) {
      return res.status(429).json({
        status: 'error',
        message: `დღიური ლიმიტი ამოწურულია (მაქსიმუმ ${MAX_OTP_PER_DAY} SMS დღეში). სცადეთ ხვალ ან დაგვიკავშირდით.`,
      });
    }

    const code = generateCode();
    const expiresAt = new Date(Date.now() + OTP_TTL_MS);

    await OtpSession.create({
      phone,
      codeHash: hashCode(code),
      purpose,
      expiresAt,
      attempts: 0,
      verified: false,
    });

    const message =
      purpose === 'login'
        ? `დიდოსტატი: შესვლის კოდია ${code}. მოქმედებს 5 წუთი.`
        : `დიდოსტატი: თქვენი დადასტურების კოდია ${code}. მოქმედებს 5 წუთი.`;
    await sendSms(phone, message);

    const payload = {
      status: 'success',
      message: 'კოდი გაიგზავნა',
      data: {
        phone,
        expiresInSeconds: Math.floor(OTP_TTL_MS / 1000),
        resendCooldownSeconds: Math.floor(RESEND_COOLDOWN_MS / 1000),
      },
    };

    if (process.env.NODE_ENV !== 'production') {
      payload.data.devCode = code;
    }

    res.json(payload);
  } catch (error) {
    console.error('sendOtp error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'OTP გაგზავნა ვერ მოხერხდა',
    });
  }
};

exports.verifyOtp = async (req, res) => {
  try {
    const phone = normalizePhone(req.body.phone);
    const code = String(req.body.code || '').trim();
    const purpose = req.body.purpose === 'login' ? 'login' : 'order';

    if (!phone) {
      return res.status(400).json({
        status: 'error',
        message: 'ვალიდური ტელეფონის ნომერია საჭირო',
      });
    }

    if (!/^\d{6}$/.test(code)) {
      return res.status(400).json({
        status: 'error',
        message: 'კოდი უნდა იყოს 6 ციფრი',
      });
    }

    const session = await OtpSession.findOne({
      phone,
      purpose,
      verified: false,
      expiresAt: { $gt: new Date() },
    }).sort('-createdAt');

    if (!session) {
      return res.status(400).json({
        status: 'error',
        message: 'კოდი ვადაგასულია ან არ არსებობს. მოითხოვეთ ახალი კოდი.',
      });
    }

    if (session.attempts >= MAX_ATTEMPTS) {
      return res.status(429).json({
        status: 'error',
        message: 'ძალიან ბევრი მცდელობა. მოითხოვეთ ახალი კოდი.',
      });
    }

    session.attempts += 1;

    if (session.codeHash !== hashCode(code)) {
      await session.save();
      return res.status(400).json({
        status: 'error',
        message: 'არასწორი კოდი',
        data: { attemptsLeft: MAX_ATTEMPTS - session.attempts },
      });
    }

    session.verified = true;
    await session.save();

    const secret = getJwtSecret();
    const otpToken = jwt.sign(
      { phone, purpose, typ: 'otp' },
      secret,
      { expiresIn: OTP_TOKEN_TTL }
    );

    res.json({
      status: 'success',
      message: 'ტელეფონი დადასტურებულია',
      data: {
        otpToken,
        phone,
        purpose,
        expiresIn: OTP_TOKEN_TTL,
      },
    });
  } catch (error) {
    console.error('verifyOtp error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'OTP ვერიფიკაცია ვერ მოხერხდა',
    });
  }
};

/** Verify otpToken — returns phone or null. purpose defaults to 'order'. */
exports.verifyOtpToken = (otpToken, expectedPurpose = 'order') => {
  if (!otpToken) return null;
  try {
    const decoded = jwt.verify(otpToken, getJwtSecret());
    if (
      decoded.typ !== 'otp' ||
      decoded.purpose !== expectedPurpose ||
      !decoded.phone
    ) {
      return null;
    }
    return normalizePhone(decoded.phone);
  } catch {
    return null;
  }
};

exports.normalizePhone = normalizePhone;
