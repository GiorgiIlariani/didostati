import type { User } from "@/lib/context/AuthContext";

function parseAllowlist(raw?: string) {
  if (!raw) return [];
  return raw
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

/**
 * Client-side admin allowlist gate.
 *
 * Configure on the frontend via `NEXT_PUBLIC_ADMIN_EMAILS`.
 * If not set, falls back to `user.role === "admin"` (backwards compatible).
 */
export function isAllowedAdmin(user: User | null | undefined): boolean {
  if (!user) return false;
  if (user.role !== "admin") return false;

  const allowlist = parseAllowlist(process.env.NEXT_PUBLIC_ADMIN_EMAILS);
  if (allowlist.length === 0) return true;

  const email = String(user.email || "").toLowerCase();
  return !!email && allowlist.includes(email);
}

