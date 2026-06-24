// GET / PATCH /api/trade/checkout-draft
//
// Server-side persistence for the 3-step trade checkout wizard. The draft
// row holds the buyer's freight choice, incoterm, ship-to address, and
// customer notes between page transitions. We deliberately keep this on
// the server (not localStorage / cookie) so:
//   - state survives device switches mid-checkout
//   - ship-to address (multi-line) is unconstrained by cookie size
//   - admins can inspect partial checkouts
//
// Storage: `hammerex_trade_checkout_drafts` keyed by account_id (UNIQUE).
// Created lazily — GET returns nulls when no row exists yet. PATCH upserts.
// The order-submission handler (POST /api/trade/orders) deletes the row
// after a successful submit.

import { NextResponse, type NextRequest } from "next/server";
import { getCurrentTradeAccount } from "@/lib/trade-auth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

const FREIGHT_MODES = new Set(["air", "sea"]);
const INCOTERMS = new Set(["FOB", "CIF", "EXW", "DAP", "DDP"]);

export type TradeCheckoutDraft = {
  freight_mode: "air" | "sea" | null;
  incoterm: string | null;
  ship_to_address: string | null;
  ship_to_country: string | null;
  customer_notes: string | null;
};

export async function GET() {
  const account = await getCurrentTradeAccount();
  if (!account) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const { data } = await supabaseAdmin
    .from("hammerex_trade_checkout_drafts")
    .select("freight_mode, incoterm, ship_to_address, ship_to_country, customer_notes")
    .eq("account_id", account.id)
    .maybeSingle();

  const draft: TradeCheckoutDraft = {
    freight_mode: (data?.freight_mode as "air" | "sea" | null) ?? null,
    incoterm: data?.incoterm ?? null,
    ship_to_address: data?.ship_to_address ?? null,
    ship_to_country: data?.ship_to_country ?? null,
    customer_notes: data?.customer_notes ?? null
  };

  return NextResponse.json({ ok: true, draft });
}

export async function PATCH(req: NextRequest) {
  const account = await getCurrentTradeAccount();
  if (!account) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  let body: Record<string, unknown> = {};
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  // Whitelisted fields only — never let arbitrary keys onto the row.
  const patch: Record<string, unknown> = {};

  if ("freight_mode" in body) {
    const v = body.freight_mode;
    if (v === null || v === "") {
      patch.freight_mode = null;
    } else if (typeof v === "string" && FREIGHT_MODES.has(v)) {
      patch.freight_mode = v;
    } else {
      return NextResponse.json(
        { ok: false, error: "freight_mode must be 'air' or 'sea'" },
        { status: 400 }
      );
    }
  }

  if ("incoterm" in body) {
    const v = body.incoterm;
    if (v === null || v === "") {
      patch.incoterm = null;
    } else if (typeof v === "string" && INCOTERMS.has(v)) {
      patch.incoterm = v;
    } else {
      return NextResponse.json(
        { ok: false, error: "Invalid incoterm" },
        { status: 400 }
      );
    }
  }

  if ("ship_to_address" in body) {
    const v = body.ship_to_address;
    patch.ship_to_address = typeof v === "string" ? v.slice(0, 2000) : null;
  }

  if ("ship_to_country" in body) {
    const v = body.ship_to_country;
    patch.ship_to_country = typeof v === "string" ? v.slice(0, 120) : null;
  }

  if ("customer_notes" in body) {
    const v = body.customer_notes;
    patch.customer_notes = typeof v === "string" ? v.slice(0, 4000) : null;
  }

  patch.updated_at = new Date().toISOString();
  patch.account_id = account.id;

  const { error } = await supabaseAdmin
    .from("hammerex_trade_checkout_drafts")
    .upsert(patch, { onConflict: "account_id" });

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  // Return the latest snapshot so the client can reconcile.
  const { data: latest } = await supabaseAdmin
    .from("hammerex_trade_checkout_drafts")
    .select("freight_mode, incoterm, ship_to_address, ship_to_country, customer_notes")
    .eq("account_id", account.id)
    .maybeSingle();

  return NextResponse.json({ ok: true, draft: latest ?? null });
}
