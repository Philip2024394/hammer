// Admin session helpers. Single-password gate signed with an HMAC cookie.
// Pattern: cookie value is `${issuedAt}.${hmac}` where hmac = HMAC-SHA256
// over `${issuedAt}.admin`. Rotating ADMIN_COOKIE_SECRET invalidates all
// existing sessions. Cookie is httpOnly + Lax + secure-in-prod.
//
// We keep the auth model deliberately tiny — one shared password, no user
// accounts. That matches the operational reality (one owner managing the
// shop) and removes a whole class of attack surface.

import { createHmac, timingSafeEqual } from "crypto";

export const ADMIN_COOKIE = "hx_admin";
const MAX_AGE_SEC = 60 * 60 * 12; // 12h session

function cookieSecret(): string {
  const s = process.env.ADMIN_COOKIE_SECRET;
  if (!s || s.length < 32) {
    throw new Error("ADMIN_COOKIE_SECRET is missing or too short (need 32+ chars)");
  }
  return s;
}

export function adminPasswordMatches(input: string): boolean {
  const real = process.env.ADMIN_PASSWORD ?? "";
  if (!real) return false;
  if (input.length !== real.length) return false;
  try {
    return timingSafeEqual(Buffer.from(input), Buffer.from(real));
  } catch {
    return false;
  }
}

export function signAdminCookie(now = Date.now()): string {
  const issuedAt = Math.floor(now / 1000);
  const mac = createHmac("sha256", cookieSecret())
    .update(`${issuedAt}.admin`)
    .digest("hex");
  return `${issuedAt}.${mac}`;
}

export function verifyAdminCookie(value: string | undefined | null, now = Date.now()): boolean {
  if (!value) return false;
  const parts = value.split(".");
  if (parts.length !== 2) return false;
  const [issuedAtStr, mac] = parts;
  const issuedAt = Number(issuedAtStr);
  if (!Number.isFinite(issuedAt)) return false;
  const ageSec = Math.floor(now / 1000) - issuedAt;
  if (ageSec < 0 || ageSec > MAX_AGE_SEC) return false;
  let expected: string;
  try {
    expected = createHmac("sha256", cookieSecret())
      .update(`${issuedAt}.admin`)
      .digest("hex");
  } catch {
    return false;
  }
  if (expected.length !== mac.length) return false;
  try {
    return timingSafeEqual(Buffer.from(expected), Buffer.from(mac));
  } catch {
    return false;
  }
}

export function adminCookieAttrs(maxAgeSec = MAX_AGE_SEC) {
  return {
    name: ADMIN_COOKIE,
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: maxAgeSec
  };
}
