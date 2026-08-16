const mongoose = require('mongoose');

/**
 * Tracks how many OTP codes a phone number has requested in the current
 * 24h window. Kept separate from `OtpSession` because that model's codes
 * expire (and get TTL-deleted) after 5 minutes, so it can't be used to
 * count requests over a full day.
 */
const otpDailyLimitSchema = new mongoose.Schema(
  {
    phone: {
      type: String,
      required: true,
    },
    // Rolling-window bucket key, e.g. "5551234567:2026-08-03" — a new
    // document (and counter) is created once the previous one expires.
    windowKey: {
      type: String,
      required: true,
      unique: true,
    },
    count: {
      type: Number,
      default: 0,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

otpDailyLimitSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('OtpDailyLimit', otpDailyLimitSchema);
