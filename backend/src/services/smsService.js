/**
 * SMS service — pluggable via SMS_PROVIDER.
 *
 *   mock       — logs the message to the console. Development only.
 *   bulksms    — bulksms.ge (Georgian reseller of Figensoft "Posta Güvercini
 *                365"; JSON API, see docs/PG365 SMS API v1.0.4 ENGLISH.odt)
 *                env: BULKSMS_PUBLIC_KEY, BULKSMS_PRIVATE_KEY,
 *                     BULKSMS_ORIGINATOR (optional), BULKSMS_API_URL (optional)
 *   smsoffice  — smsoffice.ge (Georgian provider, HTTP API, no npm dependency)
 *                env: SMSOFFICE_API_KEY, SMSOFFICE_SENDER
 *   twilio     — Twilio REST API (no npm dependency)
 *                env: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM_NUMBER
 *
 * `validateSmsConfig()` runs at startup and refuses to boot in production
 * with the mock provider (unless SMS_ALLOW_MOCK=true is set explicitly for a
 * tester deployment), so a missing env var can never silently turn real
 * OTP delivery into console logs.
 */

const SUPPORTED_PROVIDERS = ['mock', 'bulksms', 'smsoffice', 'twilio'];
const SEND_TIMEOUT_MS = 10000;
const BULKSMS_DEFAULT_API_URL = 'https://api.bulksms.ge';

function getProvider() {
  return (process.env.SMS_PROVIDER || 'mock').trim().toLowerCase();
}

/** Georgian local number (5XXXXXXXX) → international digits (9955XXXXXXXX). */
function toInternationalDigits(phone) {
  const digits = String(phone || '').replace(/\D/g, '');
  if (digits.startsWith('995')) return digits;
  return `995${digits}`;
}

async function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), SEND_TIMEOUT_MS);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

function getConfigError() {
  const provider = getProvider();

  if (!SUPPORTED_PROVIDERS.includes(provider)) {
    return `SMS_PROVIDER="${provider}" is not supported. Use one of: ${SUPPORTED_PROVIDERS.join(', ')}`;
  }

  if (provider === 'mock') {
    const isProd = process.env.NODE_ENV === 'production';
    if (isProd && process.env.SMS_ALLOW_MOCK !== 'true') {
      return (
        'SMS_PROVIDER is "mock" in production — OTP codes would only be logged, never delivered. ' +
        'Set SMS_PROVIDER=bulksms (or smsoffice / twilio) with credentials, or set SMS_ALLOW_MOCK=true ' +
        'explicitly for a tester-only deployment.'
      );
    }
    return null;
  }

  if (provider === 'bulksms') {
    if (!process.env.BULKSMS_PUBLIC_KEY || !process.env.BULKSMS_PRIVATE_KEY) {
      return 'SMS_PROVIDER=bulksms requires BULKSMS_PUBLIC_KEY and BULKSMS_PRIVATE_KEY';
    }
    const originator = process.env.BULKSMS_ORIGINATOR;
    if (originator && originator.length > 11) {
      return 'BULKSMS_ORIGINATOR must be at most 11 characters (provider limit)';
    }
    const apiUrl = process.env.BULKSMS_API_URL;
    if (apiUrl && !/^https:\/\//i.test(apiUrl)) {
      return 'BULKSMS_API_URL must start with https:// (provider requires TLS)';
    }
    return null;
  }

  if (provider === 'smsoffice') {
    if (!process.env.SMSOFFICE_API_KEY || !process.env.SMSOFFICE_SENDER) {
      return 'SMS_PROVIDER=smsoffice requires SMSOFFICE_API_KEY and SMSOFFICE_SENDER';
    }
    if (process.env.SMSOFFICE_SENDER.length > 11) {
      return 'SMSOFFICE_SENDER must be at most 11 characters (provider limit)';
    }
    return null;
  }

  if (provider === 'twilio') {
    if (
      !process.env.TWILIO_ACCOUNT_SID ||
      !process.env.TWILIO_AUTH_TOKEN ||
      !process.env.TWILIO_FROM_NUMBER
    ) {
      return 'SMS_PROVIDER=twilio requires TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN and TWILIO_FROM_NUMBER';
    }
    return null;
  }

  return null;
}

/**
 * Call once at startup. Throws in production when SMS is misconfigured so
 * the deploy fails loudly instead of "working" without delivering codes.
 */
function validateSmsConfig() {
  const error = getConfigError();
  const provider = getProvider();

  if (error) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error(`[SMS] ${error}`);
    }
    console.warn(`⚠️  [SMS] ${error}`);
    return;
  }

  if (provider === 'mock') {
    console.warn(
      process.env.NODE_ENV === 'production'
        ? '⚠️  [SMS] Running with MOCK provider in production (SMS_ALLOW_MOCK=true). OTP codes are only logged!'
        : '📱 [SMS] Mock provider — OTP codes are printed to this console.'
    );
  } else {
    console.log(`📱 [SMS] Provider: ${provider}`);
  }
}

/**
 * bulksms.ge — Figensoft "Posta Güvercini 365" gateway.
 *
 *   POST {BULKSMS_API_URL}/gateway/api/sms/v1/message/send?publicKey=...
 *   Authorization: Bearer {PrivateKey}
 *
 * The API accepts a list of receivers and answers 200 even when some of them
 * were rejected, so a successful send is "our one receiver is in
 * ReceiversAccepted", not just "HTTP 200".
 */
async function sendViaBulkSms(phone, message) {
  const publicKey = process.env.BULKSMS_PUBLIC_KEY;
  const privateKey = process.env.BULKSMS_PRIVATE_KEY;
  const baseUrl = (process.env.BULKSMS_API_URL || BULKSMS_DEFAULT_API_URL).replace(/\/+$/, '');
  const originator = (process.env.BULKSMS_ORIGINATOR || '').trim();
  const receiver = toInternationalDigits(phone);

  const options = {
    // Our OTP texts are Georgian — LATIN (the provider default) would
    // garble them. UNICODE must be enabled for the account by the provider.
    Encoding: 'UNICODE',
    SmsType: 'SMS',
    ReportLabel: 'Didostati OTP',
  };
  // Empty Originator → provider falls back to the default title on the account.
  if (originator) options.Originator = originator;

  const url = `${baseUrl}/gateway/api/sms/v1/message/send?publicKey=${encodeURIComponent(publicKey)}`;
  const res = await fetchWithTimeout(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${privateKey}`,
    },
    body: JSON.stringify({
      Text: message,
      Purpose: 'OTP',
      Options: options,
      Receivers: [{ Receiver: receiver }],
    }),
  });

  const text = await res.text();
  let data = null;
  try {
    data = JSON.parse(text);
  } catch {
    // fall through — handled below
  }

  if (!res.ok) {
    throw new Error(`BulkSMS HTTP ${res.status}: ${text.slice(0, 200)}`);
  }
  if (!data || Number(data.Status) !== 200) {
    const reason = (data && data.Description) || text.slice(0, 200) || 'unknown error';
    throw new Error(`BulkSMS rejected request (Status ${data ? data.Status : '?'}): ${reason}`);
  }

  const accepted = data.Result?.ReceiversAccepted ?? [];
  const rejected = data.Result?.ReceiversRejected ?? [];
  if (!accepted.length) {
    const r = rejected[0];
    const reason = r ? `${r.ErrorCode || ''} ${r.ErrorMessage || ''}`.trim() : 'receiver not accepted';
    throw new Error(`BulkSMS rejected receiver ${receiver}: ${reason}`);
  }

  return { provider: 'bulksms', id: accepted[0].id ?? null };
}

async function sendViaSmsOffice(phone, message) {
  const params = new URLSearchParams({
    key: process.env.SMSOFFICE_API_KEY,
    destination: toInternationalDigits(phone),
    sender: process.env.SMSOFFICE_SENDER,
    content: message,
    // Transactional (OTP) — deliver even if the receiver opted out of marketing.
    urgent: 'true',
  });

  const res = await fetchWithTimeout('https://smsoffice.ge/api/v2/send/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  });

  const text = await res.text();
  let data = null;
  try {
    data = JSON.parse(text);
  } catch {
    // fall through — handled below
  }

  if (!res.ok) {
    throw new Error(`SMS Office HTTP ${res.status}: ${text.slice(0, 200)}`);
  }
  if (!data || data.Success !== true || (data.ErrorCode && data.ErrorCode !== 0)) {
    const reason = (data && data.Message) || text.slice(0, 200) || 'unknown error';
    throw new Error(`SMS Office rejected message: ${reason}`);
  }

  return { provider: 'smsoffice', id: data.Output ?? null };
}

async function sendViaTwilio(phone, message) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_FROM_NUMBER;

  // Twilio requires E.164 (+995...).
  const to = `+${toInternationalDigits(phone)}`;
  const params = new URLSearchParams({ To: to, From: from, Body: message });

  const res = await fetchWithTimeout(
    `https://api.twilio.com/2010-04-01/Accounts/${encodeURIComponent(accountSid)}/Messages.json`,
    {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    }
  );

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(`Twilio error ${data.code || res.status}: ${data.message || 'send failed'}`);
  }
  return { provider: 'twilio', id: data.sid || null };
}

async function sendSms(phone, message) {
  const provider = getProvider();

  if (provider === 'bulksms') return sendViaBulkSms(phone, message);
  if (provider === 'smsoffice') return sendViaSmsOffice(phone, message);
  if (provider === 'twilio') return sendViaTwilio(phone, message);

  // Mock — never deliver, only log. Refused in production by validateSmsConfig()
  // unless SMS_ALLOW_MOCK=true.
  console.log(`[SMS mock] to=${phone} message=${message}`);
  return { provider: 'mock' };
}

module.exports = { sendSms, validateSmsConfig, SUPPORTED_PROVIDERS };
