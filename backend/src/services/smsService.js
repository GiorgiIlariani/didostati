/**
 * SMS service — pluggable.
 * Dev: logs code; optionally returns code in API response (NODE_ENV=development).
 * Prod: set SMS_PROVIDER + credentials (e.g. Twilio) when ready.
 */

async function sendSms(phone, message) {
  const provider = (process.env.SMS_PROVIDER || 'mock').toLowerCase();

  if (provider === 'twilio') {
    // Placeholder for Twilio — configure when credentials are available
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const from = process.env.TWILIO_FROM_NUMBER;
    if (!accountSid || !authToken || !from) {
      throw new Error('Twilio SMS is not configured');
    }
    // phone is a normalized Georgian local number (5XXXXXXXX) — Twilio
    // requires E.164 (+995...), otherwise the send silently targets the
    // wrong number or is rejected by the API.
    const e164Phone = phone.startsWith('+') ? phone : `+995${phone}`;
    // Dynamic require only when configured — avoids hard dependency
    // eslint-disable-next-line global-require
    const twilio = require('twilio')(accountSid, authToken);
    await twilio.messages.create({ body: message, from, to: e164Phone });
    return { provider: 'twilio' };
  }

  // Default mock
  console.log(`[SMS mock] to=${phone} message=${message}`);
  return { provider: 'mock' };
}

module.exports = { sendSms };
