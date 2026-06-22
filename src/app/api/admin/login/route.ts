// POST /api/admin/login
// Body: { password: string }
// On success: sets the signed admin cookie and returns { ok: true }.
// On failure: returns 401 with a generic message.
//
// Brute-force protection:
//   - Per-IP throttle backed by hammerex_admin_login_attempts (Supabase).
//   - More than MAX_ATTEMPTS failures in the last LOOKBACK_MS rejects with
//     429 before the password is even compared (constant-time avoidance).
//   - Every attempt (success or failure) is recorded, hashed by IP, so we
//     have an audit trail without storing raw IPs.

import { NextResponse, type NextRequest } from "next/server";
import { createHash } from "crypto";
import { ADMIN_COOKIE, adminCookieAttrs, adminPasswordMatches, signAdminCookie } from "@/lib/adminAuth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const MAX_ATTEMPTS = 5;
const LOOKBACK_MS = 15 * 60 * 1000;

function getClientIp(req: NextRequest): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]!.trim();
  const real = req.headers.get("x-real-ip");
  if (real) return real.trim();
  return "0.0.0.0";
}

function hashIp(ip: string): string {
  const salt = process.env.ADMIN_COOKIE_SECRET ?? "fallback-salt";
  return createHash("sha256").update(`${salt}:${ip}`).digest("hex");
}

async function recordAttempt(ipHash: string, success: boolean, ua: string | null) {
  try {
    await supabaseAdmin.from("hammerex_admin_login_attempts").insert({
      ip_hash: ipHash,
      success,
      user_agent: ua?.slice(0, 500) ?? null
    });
  } catch (e) {
    console.error("Failed to record admin login attempt", e);
  }
}

async function recentFailures(ipHash: string): Promise<number> {
  const since = new Date(Date.now() - LOOKBACK_MS).toISOString();
  try {
    const { count, error } = await supabaseAdmin
      .from("hammerex_admin_login_attempts")
      .select("id", { count: "exact", head: true })
      .eq("ip_hash", ipHash)
      .eq("success", false)
      .gte("attempted_at", since);
    if (error) throw error;
    return count ?? 0;
  } catch (e) {
    console.error("Failed to read admin login attempts", e);
    return 0; // fail-open on DB error so admin can still log in
  }
}

export async function POST(req: NextRequest) {
  const ipHash = hashIp(getClientIp(req));
  const ua = req.headers.get("user-agent");

  const fails = await recentFailures(ipHash);
  if (fails >= MAX_ATTEMPTS) {
    return NextResponse.json(
      { ok: false, error: "Too many failed attempts. Try again in 15 minutes." },
      { status: 429 }
    );
  }

  let password = "";
  try {
    const body = await req.json();
    password = String(body?.password ?? "");
  } catch {
    await recordAttempt(ipHash, false, ua);
    return NextResponse.json({ ok: false, error: "Bad request" }, { status: 400 });
  }

  if (!adminPasswordMatches(password)) {
    await recordAttempt(ipHash, false, ua);
    return NextResponse.json({ ok: false, error: "Incorrect password" }, { status: 401 });
  }

  await recordAttempt(ipHash, true, ua);

  const res = NextResponse.json({ ok: true });
  const attrs = adminCookieAttrs();
  res.cookies.set({
    name: ADMIN_COOKIE,
    value: signAdminCookie(),
    httpOnly: attrs.httpOnly,
    sameSite: attrs.sameSite,
    secure: attrs.secure,
    path: attrs.path,
    maxAge: attrs.maxAge
  });
  return res;
}
