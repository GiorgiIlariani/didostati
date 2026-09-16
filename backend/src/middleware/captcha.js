/**
 * Cloudflare Turnstile verification for endpoints that cost money or can be
 * used to harass a user (OTP SMS sends).
 *
 * Enabled only when TURNSTILE_SECRET_KEY is set. Without it the middleware is
 * a no-op so a deployment without keys keeps working (a warning is logged at
 * startup by validateCaptchaConfig). The frontend mirrors this with
 * NEXT_PUBLIC_TURNSTILE_SITE_KEY — both must be set for the check to apply.
 */

const VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
const VERIFY_TIMEOUT_MS = 8000;

function isCaptchaEnabled() {
  return Boolean(process.env.TURNSTILE_SECRET_KEY);
}

function validateCaptchaConfig() {
  if (isCaptchaEnabled()) {
    console.log('🛡️  [CAPTCHA] Turnstile enabled for OTP sends');
    return;
  }
  const msg =
    '[CAPTCHA] TURNSTILE_SECRET_KEY is not set — OTP sends are NOT bot-protected. ' +
    'Create a free Turnstile widget at dash.cloudflare.com and set TURNSTILE_SECRET_KEY ' +
    '(backend) + NEXT_PUBLIC_TURNSTILE_SITE_KEY (frontend).';
  if (process.env.NODE_ENV === 'production') console.warn(`⚠️  ${msg}`);
  else console.log(`ℹ️  ${msg}`);
}

async function verifyTurnstileToken(token, remoteip) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), VERIFY_TIMEOUT_MS);
  try {
    const params = new URLSearchParams({
      secret: process.env.TURNSTILE_SECRET_KEY,
      response: token,
    });
    if (remoteip) params.set('remoteip', remoteip);

    const res = await fetch(VERIFY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
      signal: controller.signal,
    });
    const data = await res.json().catch(() => ({}));
    return { ok: data.success === true, errors: data['error-codes'] || [] };
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Express middleware. Expects `captchaToken` in the JSON body.
 */
async function requireCaptcha(req, res, next) {
  if (!isCaptchaEnabled()) return next();

  const token = typeof req.body?.captchaToken === 'string' ? req.body.captchaToken.trim() : '';
  if (!token || token.length > 4096) {
    return res.status(400).json({
      status: 'error',
      code: 'CAPTCHA_REQUIRED',
      message: 'უსაფრთხოების შემოწმება საჭიროა. განაახლეთ გვერდი და სცადეთ ხელახლა.',
    });
  }

  try {
    const { ok, errors } = await verifyTurnstileToken(token, req.ip);
    if (!ok) {
      console.warn('[CAPTCHA] Turnstile rejected token:', errors.join(', ') || 'unknown');
      return res.status(400).json({
        status: 'error',
        code: 'CAPTCHA_FAILED',
        message: 'უსაფრთხოების შემოწმება ვერ გავიდა. სცადეთ ხელახლა.',
      });
    }
    next();
  } catch (err) {
    // Fail closed: if Cloudflare is unreachable we would rather delay a
    // login than let a bot drain the SMS balance.
    console.error('[CAPTCHA] Turnstile verification error:', err.message);
    return res.status(503).json({
      status: 'error',
      code: 'CAPTCHA_UNAVAILABLE',
      message: 'უსაფრთხოების შემოწმება დროებით მიუწვდომელია. სცადეთ რამდენიმე წამში.',
    });
  }
}

module.exports = { requireCaptcha, isCaptchaEnabled, validateCaptchaConfig };
