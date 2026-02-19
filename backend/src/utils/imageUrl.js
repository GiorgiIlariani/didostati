/**
 * Rewrites http→https for backend image URLs.
 * Fixes mixed-content errors when frontend (HTTPS) loads images from API (HTTP behind proxy).
 */
function ensureHttpsImageUrls(data) {
  if (!data) return data;
  const str = JSON.stringify(data);
  return JSON.parse(
    str.replace(/http:\/\/didostati-backend\.onrender\.com/g, "https://didostati-backend.onrender.com")
  );
}

module.exports = { ensureHttpsImageUrls };
