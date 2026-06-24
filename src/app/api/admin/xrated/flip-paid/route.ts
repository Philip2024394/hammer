// POST /api/admin/xrated/flip-paid
// Body (JSON or form-encoded): {
//   slug: string,
//   plan: "monthly" | "annual",
//   amount_gbp?: number,
//   admin_note?: string
// }
//
// Looks up the listing by slug, inserts a row into
// hammerex_xrated_payments and flips the listing to tier='app_paid'
// with paid_expires_at = now + 30d (monthly) or +365d (annual).
//
// Accepts both JSON (from fetch) and form-encoded bodies (from the
// admin drill-in page's inline form) for ergonomics. Form submits
// redirect back to the drill-in; JSON submits return JSON.

import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_COOKIE, verifyAdminCookie } from "@/lib/adminAuth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { XRATED_PRICING } from "@/lib/xratedTrades";

export const runtime = "nodejs";

const VALID_PLANS = new Set(["monthly", "annual"]);

type ParsedBody = {
  slug: string;
  plan: "monthly" | "annual";
  amount_gbp: number | null;
  admin_note: string | null;
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
  const plan = typeof raw.plan === "string" ? raw.plan.trim() : "";
  if (!slug || !VALID_PLANS.has(plan)) return null;
  let amount_gbp: number | null = null;
  if (raw.amount_gbp !== undefined && raw.amount_gbp !== "") {
    const n = Number(raw.amount_gbp);
    if (Number.isFinite(n) && n >= 0) amount_gbp = n;
  }
  const admin_note =
    typeof raw.admin_note === "string" && raw.admin_note.trim()
      ? raw.admin_note.trim().slice(0, 2000)
      : null;
  return {
    slug,
    plan: plan as "monthly" | "annual",
    amount_gbp,
    admin_note,
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
      { ok: false, error: "Bad request — needs slug + plan" },
      { status: 400 }
    );
  }

  const lookup = await supabaseAdmin
    .from("hammerex_trade_off_listings")
    .select("id, slug")
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

  const listingId = lookup.data.id as string;
  const paidAt = new Date();
  const days = body.plan === "annual" ? 365 : 30;
  const expiresAt = new Date(paidAt.getTime() + days * 86400 * 1000);
  const amount =
    body.amount_gbp ??
    (body.plan === "annual"
      ? XRATED_PRICING.annualGbp
      : XRATED_PRICING.monthlyGbp);

  const payment = await supabaseAdmin
    .from("hammerex_xrated_payments")
    .insert({
      listing_id: listingId,
      plan: body.plan,
      amount_gbp: amount,
      paid_at: paidAt.toISOString(),
      paid_via: "admin_manual",
      admin_note: body.admin_note,
      expires_at: expiresAt.toISOString()
    })
    .select("id, expires_at")
    .single();

  if (payment.error) {
    return NextResponse.json(
      { ok: false, error: payment.error.message },
      { status: 500 }
    );
  }

  const upd = await supabaseAdmin
    .from("hammerex_trade_off_listings")
    .update({
      tier: "app_paid",
      paid_expires_at: expiresAt.toISOString(),
      last_payment_plan: body.plan
    })
    .eq("id", listingId);

  if (upd.error) {
    return NextResponse.json(
      { ok: false, error: upd.error.message },
      { status: 500 }
    );
  }

  if (body.isForm) {
    // Form-encoded submits get a 303 redirect back to the drill-in so
    // the page re-renders with the updated tier + payment row.
    const url = new URL(`/admin/xrated/${body.slug}`, req.url);
    return NextResponse.redirect(url, { status: 303 });
  }
  return NextResponse.json({ ok: true, expires_at: expiresAt.toISOString() });
}
