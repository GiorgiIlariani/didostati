/**
 * Rewrites old Render image URLs → live site origin so images load from the droplet.
 */
function ensureHttpsImageUrls(data) {
  if (!data) return data;
  const origin = (process.env.FRONTEND_URL || "").replace(/\/+$/, "");
  let str = JSON.stringify(data);
  if (origin) {
    str = str.replace(/https?:\/\/didostati-backend\.onrender\.com/g, origin);
  }
  return JSON.parse(str);
}

module.exports = { ensureHttpsImageUrls };
