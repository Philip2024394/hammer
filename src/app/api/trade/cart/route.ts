// /api/trade/cart — trade cart line management.
//
//   POST  → add a line (or merge into an existing matching line). Enforces
//           MOQ floor server-side: if the client passed qty < moq, we bump
//           qty up to moq and tell the client (`was_bumped: true`).
//
//   GET   → return the signed-in account's full cart, joined to product
//           name / image / sku / moq / trade_price_gbp / stock_count plus
//           the same fields on the variant when one is selected.
//
// All routes require a signed-in trade account (`getCurrentTradeAccount`).
// Unauthenticated callers get 401. We deliberately do NOT 404 here because
// /api/trade/* is reachable by middleware only after a valid Supabase auth
// cookie is set — the 401 is a clearer signal for the client.

import { NextResponse, type NextRequest } from "next/server";
import { getCurrentTradeAccount } from "@/lib/trade-auth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type PostBody = {
  product_id?: string;
  variant_id?: string | null;
  size?: string | null;
  thread_color?: string | null;
  qty?: number;
};

const MAX_QTY = 9999;

function isUuid(v: unknown): v is string {
  return typeof v === "string" && /^[0-9a-f-]{36}$/i.test(v);
}

export async function POST(req: NextRequest) {
  const account = await getCurrentTradeAccount();
  if (!account) {
    return NextResponse.json({ error: "unauthorised" }, { status: 401 });
  }

  let body: PostBody;
  try {
    body = (await req.json()) as PostBody;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const { product_id, variant_id, size, thread_color } = body;
  let qty = Math.floor(Number(body.qty));
  if (!isUuid(product_id)) {
    return NextResponse.json({ error: "product_id required" }, { status: 400 });
  }
  if (variant_id != null && !isUuid(variant_id)) {
    return NextResponse.json({ error: "variant_id must be a UUID" }, { status: 400 });
  }
  if (!Number.isFinite(qty) || qty <= 0) qty = 1;
  if (qty > MAX_QTY) qty = MAX_QTY;

  // Look up MOQ + trade price gating. A product without trade_price_gbp set
  // must NOT be added — that's the "trade buyer should not see this" rule
  // from the catalogue and we re-enforce it server-side so a stale tab
  // can't sneak an off-list product into the cart.
  const productRes = await supabaseAdmin
    .from("hammerex_products")
    .select("id, moq, trade_price_gbp")
    .eq("id", product_id)
    .maybeSingle();
  if (productRes.error || !productRes.data) {
    return NextResponse.json({ error: "product_not_found" }, { status: 404 });
  }
  if (productRes.data.trade_price_gbp == null) {
    return NextResponse.json({ error: "no_trade_price" }, { status: 400 });
  }

  let moq = (productRes.data.moq as number | null) ?? 1;
  let resolvedVariantId: string | null = variant_id ?? null;

  if (resolvedVariantId) {
    const variantRes = await supabaseAdmin
      .from("hammerex_product_variants")
      .select("id, product_id, moq, trade_price_gbp")
      .eq("id", resolvedVariantId)
      .maybeSingle();
    if (variantRes.error || !variantRes.data) {
      return NextResponse.json({ error: "variant_not_found" }, { status: 404 });
    }
    if (variantRes.data.product_id !== product_id) {
      return NextResponse.json({ error: "variant_product_mismatch" }, { status: 400 });
    }
    // Variant MOQ overrides product MOQ when set.
    if (variantRes.data.moq != null) moq = variantRes.data.moq as number;
  }

  if (moq <= 0) moq = 1;
  const wasBumped = qty < moq;
  if (wasBumped) qty = moq;

  // No DB unique constraint covers (account, product, variant, size,
  // thread_color), so we look up an existing matching row in code (filter
  // on the variant via .eq()/.is(), then narrow size + thread_color in JS
  // — keeps the cart-merge logic in one place and avoids fiddly nullable
  // .eq()/.is() chains for optional text columns).
  const lookupQ = supabaseAdmin
    .from("hammerex_trade_cart_items")
    .select("id, qty, size, thread_color, variant_id")
    .eq("account_id", account.id)
    .eq("product_id", product_id);
  const lookup = resolvedVariantId
    ? await lookupQ.eq("variant_id", resolvedVariantId)
    : await lookupQ.is("variant_id", null);
  if (lookup.error) {
    return NextResponse.json({ error: "cart_lookup_failed" }, { status: 500 });
  }
  const sameSize = (r: { size: string | null }) =>
    (size ?? null) === (r.size ?? null);
  const sameColor = (r: { thread_color: string | null }) =>
    (thread_color ?? null) === (r.thread_color ?? null);
  const match = (lookup.data ?? []).find(
    (r) => sameSize(r) && sameColor(r)
  );

  if (match) {
    const newQty = Math.min(MAX_QTY, (match.qty as number) + qty);
    const upd = await supabaseAdmin
      .from("hammerex_trade_cart_items")
      .update({ qty: newQty })
      .eq("id", match.id)
      .select("id, qty")
      .maybeSingle();
    if (upd.error || !upd.data) {
      return NextResponse.json({ error: "cart_update_failed" }, { status: 500 });
    }
    return NextResponse.json({
      added: true,
      merged: true,
      cart_item_id: upd.data.id,
      qty_used: qty,
      total_qty: upd.data.qty,
      was_bumped: wasBumped,
      moq
    });
  }

  const ins = await supabaseAdmin
    .from("hammerex_trade_cart_items")
    .insert({
      account_id: account.id,
      product_id,
      variant_id: resolvedVariantId,
      size: size ?? null,
      thread_color: thread_color ?? null,
      qty
    })
    .select("id, qty")
    .single();
  if (ins.error || !ins.data) {
    return NextResponse.json({ error: "cart_insert_failed" }, { status: 500 });
  }

  return NextResponse.json({
    added: true,
    merged: false,
    cart_item_id: ins.data.id,
    qty_used: qty,
    total_qty: ins.data.qty,
    was_bumped: wasBumped,
    moq
  });
}

export async function GET() {
  const account = await getCurrentTradeAccount();
  if (!account) {
    return NextResponse.json({ error: "unauthorised" }, { status: 401 });
  }

  const res = await supabaseAdmin
    .from("hammerex_trade_cart_items")
    .select(
      `
        id, qty, size, thread_color, added_at,
        product:hammerex_products!hammerex_trade_cart_items_product_id_fkey(
          id, slug, name, sku, image_url, trade_price_gbp, moq, price_idr, stock_count
        ),
        variant:hammerex_product_variants!hammerex_trade_cart_items_variant_id_fkey(
          id, label, sku, trade_price_gbp, moq, price_idr, stock_count
        )
      `
    )
    .eq("account_id", account.id)
    .order("added_at", { ascending: false });

  if (res.error) {
    return NextResponse.json({ error: "cart_read_failed" }, { status: 500 });
  }
  return NextResponse.json({
    account: {
      id: account.id,
      trade_account_no: account.trade_account_no,
      currency: account.currency
    },
    items: res.data ?? []
  });
}
