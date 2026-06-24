// POST /api/admin/xrated/set-tier
// Body (JSON or form-encoded): {
//   slug: string,
//   tier: "standard" | "app_trial" | "app_paid" | "app_expired",
//   extend_days?: number
// }
//
// Manual tier override. If tier='app_trial' and extend_days is set,
// also bumps trial_expires_at to now + extend_days. Otherwise just
// flips the tier.

import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_COOKIE, verifyAdminCookie } from "@/lib/adminAuth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

const VALID_TIERS = new Set([
  "standard",
  "app_trial",
  "app_paid",
  "app_expired"
]);

type ParsedBody = {
  slug: string;
  tier: "standard" | "app_trial" | "app_paid" | "app_expired";
  extend_days: number | null;
  isForm: boolean;
};

async function parseBody(req: NextRequest): Promise<ParsedBody | null> {
  const ct = (req.headers.get("content-type") ?? "").toLowerCase();
  let raw: Record<string, unknown> = {};
  let isForm = false;
  try {
    if (ct.includes("application/json")) {
      raw = (await req.json()) as Record<string, unknown>;
    } else {
      isForm = true;
      const fd = await req.formData();
      raw = Object.fromEntries(fd.entries());
    }
  } catch {
    return null;
  }
  const slug =
    typeof raw.slug === "string" ? raw.slug.trim().toLowerCase() : "";
  const tier = typeof raw.tier === "string" ? raw.tier.trim() : "";
  if (!slug || !VALID_TIERS.has(tier)) return null;
  let extend_days: number | null = null;
  if (raw.extend_days !== undefined && raw.extend_days !== "") {
    const n = Number(raw.extend_days);
    if (Number.isFinite(n) && n > 0 && n <= 3650) extend_days = Math.floor(n);
  }
  return {
    slug,
    tier: tier as ParsedBody["tier"],
    extend_days,
    isForm
  };
}

export async function POST(req: NextRequest) {
  const cookie = req.cookies.get(ADMIN_COOKIE)?.value;
  if (!verifyAdminCookie(cookie)) {
    return NextResponse.json(
      { ok: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  const body = await parseBody(req);
  if (!body) {
    return NextResponse.json(
      { ok: false, error: "Bad request — needs slug + valid tier" },
      { status: 400 }
    );
  }

  const lookup = await supabaseAdmin
    .from("hammerex_trade_off_listings")
    .select("id")
    .eq("slug", body.slug)
    .maybeSingle();
  if (lookup.error) {
    return NextResponse.json(
      { ok: false, error: lookup.error.message },
      { status: 500 }
    );
  }
  if (!lookup.data) {
    return NextResponse.json(
      { ok: false, error: "Listing not found" },
      { status: 404 }
    );
  }

  const patch: Record<string, unknown> = { tier: body.tier };
  if (body.tier === "app_trial" && body.extend_days) {
    const expiresAt = new Date(Date.now() + body.extend_days * 86400 * 1000);
    patch.trial_expires_at = expiresAt.toISOString();
    // Backfill trial_started_at if the listing never had a trial before.
    patch.trial_started_at = new Date().toISOString();
  }

  const upd = await supabaseAdmin
    .from("hammerex_trade_off_listings")
    .update(patch)
    .eq("id", lookup.data.id as string);
  if (upd.error) {
    return NextResponse.json(
      { ok: false, error: upd.error.message },
      { status: 500 }
    );
  }

  if (body.isForm) {
    const url = new URL(`/admin/xrated/${body.slug}`, req.url);
    return NextResponse.redirect(url, { status: 303 });
  }
  return NextResponse.json({ ok: true });
}
