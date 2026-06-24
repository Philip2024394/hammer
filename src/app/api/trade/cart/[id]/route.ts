// /api/trade/cart/[id] — PATCH (update line qty) and DELETE (remove line).
//
// All callers must own the cart line (account_id == current trade account).
// The route uses supabaseAdmin to bypass RLS but enforces ownership in code:
// we filter on both `id` and `account_id` so a stranger's line is untouched.
//
// MOQ enforcement on PATCH: if the requested qty < moq, we bump the qty up
// to moq and return `was_bumped: true` so the client can re-render the
// stepper accordingly.

import { NextResponse, type NextRequest } from "next/server";
import { getCurrentTradeAccount } from "@/lib/trade-auth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_QTY = 9999;

function isUuid(v: unknown): v is string {
  return typeof v === "string" && /^[0-9a-f-]{36}$/i.test(v);
}

async function loadOwnedLine(id: string, accountId: string) {
  const res = await supabaseAdmin
    .from("hammerex_trade_cart_items")
    .select("id, account_id, product_id, variant_id, qty")
    .eq("id", id)
    .eq("account_id", accountId)
    .maybeSingle();
  return res.data ?? null;
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!isUuid(id)) {
    return NextResponse.json({ error: "bad_id" }, { status: 400 });
  }
  const account = await getCurrentTradeAccount();
  if (!account) {
    return NextResponse.json({ error: "unauthorised" }, { status: 401 });
  }

  let body: { qty?: number };
  try {
    body = (await req.json()) as { qty?: number };
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  let qty = Math.floor(Number(body.qty));
  if (!Number.isFinite(qty) || qty <= 0) {
    return NextResponse.json({ error: "qty_must_be_positive" }, { status: 400 });
  }
  if (qty > MAX_QTY) qty = MAX_QTY;

  const line = await loadOwnedLine(id, account.id);
  if (!line) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  // Resolve MOQ from variant (preferred) → product fallback.
  let moq = 1;
  if (line.variant_id) {
    const v = await supabaseAdmin
      .from("hammerex_product_variants")
      .select("moq")
      .eq("id", line.variant_id)
      .maybeSingle();
    if (v.data?.moq != null) moq = v.data.moq as number;
  }
  if (moq <= 1) {
    const p = await supabaseAdmin
      .from("hammerex_products")
      .select("moq")
      .eq("id", line.product_id)
      .maybeSingle();
    if (p.data?.moq != null) moq = Math.max(moq, p.data.moq as number);
  }
  if (moq <= 0) moq = 1;

  const wasBumped = qty < moq;
  if (wasBumped) qty = moq;

  const upd = await supabaseAdmin
    .from("hammerex_trade_cart_items")
    .update({ qty })
    .eq("id", id)
    .eq("account_id", account.id)
    .select("id, qty")
    .maybeSingle();
  if (upd.error || !upd.data) {
    return NextResponse.json({ error: "update_failed" }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    cart_item_id: upd.data.id,
    qty: upd.data.qty,
    was_bumped: wasBumped,
    moq
  });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!isUuid(id)) {
    return NextResponse.json({ error: "bad_id" }, { status: 400 });
  }
  const account = await getCurrentTradeAccount();
  if (!account) {
    return NextResponse.json({ error: "unauthorised" }, { status: 401 });
  }

  const line = await loadOwnedLine(id, account.id);
  if (!line) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const del = await supabaseAdmin
    .from("hammerex_trade_cart_items")
    .delete()
    .eq("id", id)
    .eq("account_id", account.id);
  if (del.error) {
    return NextResponse.json({ error: "delete_failed" }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
