/**
 * Only allow same-site paths ("/checkout", not "https://evil.com" or
 * "//evil.com") so ?redirect= on login/register can't be abused as an open
 * redirect for phishing.
 */
export function safeRedirect(raw: string | null | undefined): string {
  if (!raw) return "/";
  if (!raw.startsWith("/") || raw.startsWith("//") || raw.startsWith("/\\")) {
    return "/";
  }
  return raw;
}
