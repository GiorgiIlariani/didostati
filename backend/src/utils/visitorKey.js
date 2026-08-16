const crypto = require("crypto");

const VISITOR_ID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function getClientIp(req) {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.trim()) {
    return forwarded.split(",")[0].trim();
  }
  return req.ip || req.socket?.remoteAddress || "unknown";
}

function getVisitorKey(req) {
  if (req.user?._id) {
    return `user:${req.user._id}`;
  }

  const headerId = req.headers["x-visitor-id"];
  if (typeof headerId === "string" && VISITOR_ID_RE.test(headerId)) {
    return `vid:${headerId.toLowerCase()}`;
  }

  const ip = getClientIp(req);
  return `ip:${crypto.createHash("sha256").update(ip).digest("hex").slice(0, 32)}`;
}

module.exports = { getVisitorKey };
