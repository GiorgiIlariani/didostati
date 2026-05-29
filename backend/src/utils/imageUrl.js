/**
 * Normalizes image URLs in API responses so next/image can load them:
 *  1. Rewrites legacy Render-hosted assets to the live site origin.
 *  2. Upgrades any remaining insecure http:// URLs to https:// (except localhost),
 *     since older records stored production assets as http and next/image rejects
 *     insecure/unconfigured hosts.
 */
function ensureHttpsImageUrls(data) {
  if (!data) return data;
  const origin = (process.env.FRONTEND_URL || "").replace(/\/+$/, "");
  let str = JSON.stringify(data);
  if (origin) {
    str = str.replace(/https?:\/\/didostati-backend\.onrender\.com/g, origin);
  }
  // Upgrade insecure remote URLs to HTTPS; leave localhost alone for dev.
  str = str.replace(
    /http:\/\/(?!localhost|127\.0\.0\.1)([^"'\\\s]+)/g,
    "https://$1",
  );
  return JSON.parse(str);
}

/**
 * Builds the public base URL for uploaded files.
 *
 * In production we prefer the configured public origin (FRONTEND_URL), because
 * /uploads is reachable over HTTPS through that domain. This avoids depending on
 * the reverse proxy forwarding X-Forwarded-Proto correctly, which would otherwise
 * produce insecure http:// URLs that next/image rejects.
 *
 * Locally (no FRONTEND_URL / not production) we fall back to the request origin.
 */
function getPublicBaseUrl(req) {
  const configured = (process.env.FRONTEND_URL || "").replace(/\/+$/, "");
  if (process.env.NODE_ENV === "production" && configured) {
    return configured;
  }

  const protocol =
    process.env.NODE_ENV === "production" ? "https" : req.protocol;
  return `${protocol}://${req.get("host")}`;
}

module.exports = { ensureHttpsImageUrls, getPublicBaseUrl };
