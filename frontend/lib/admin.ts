import type { User } from "@/lib/context/AuthContext";

function parseAllowlist(raw?: string) {
  if (!raw) return [];
  return raw
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

/**
 * Full admin gate (client-side allowlist).
 *
 * Configure on the frontend via `NEXT_PUBLIC_ADMIN_EMAILS`.
 * If not set, falls back to `user.role === "admin"` (backwards compatible).
 *
 * NOTE: this is a UX convenience only — real enforcement happens on the
 * backend (see `restrictTo` in the API). Never rely on this alone.
 */
export function isFullAdmin(user: User | null | undefined): boolean {
  if (!user) return false;
  if (user.role !== "admin") return false;

  const allowlist = parseAllowlist(process.env.NEXT_PUBLIC_ADMIN_EMAILS);
  if (allowlist.length === 0) return true;

  const email = String(user.email || "").toLowerCase();
  return !!email && allowlist.includes(email);
}

/** Limited role: can manage products, but nothing else in the admin panel. */
export function isStaff(user: User | null | undefined): boolean {
  return !!user && user.role === "staff";
}

/** Has access to the admin panel at all (full admin or limited staff). */
export function isAllowedAdmin(user: User | null | undefined): boolean {
  return isFullAdmin(user) || isStaff(user);
}

