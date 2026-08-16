/**
 * Escape regex metacharacters in user-supplied text before building a
 * `new RegExp(...)` from it. Without this, characters like `.`, `*`, `(`,
 * `|` let a caller inject arbitrary regex patterns (ReDoS risk, and
 * unintended matches) into search/filter queries.
 */
function escapeRegex(str) {
  return String(str).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

module.exports = { escapeRegex };
