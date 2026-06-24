// POST /api/admin/products/[id]
// Body (all fields optional — any subset can be saved at once):
//   price_idr:          number  → canonical UK/RoW IDR price (stored as-is)
//   free_uk_delivery:   boolean → shipping_per_unit_idr = 0 when true, null otherwise
//   price_idr_sea:      number  → SEA visitors' price in raw IDR (0 = "Quoted at checkout")
//   free_shipping_sea:  boolean → free shipping flag for ID/MY/VN visitors only
//   trade_price_gbp:    number | null → trade-channel GBP price per unit (null = no trade price)
//   moq:                number | null → minimum order qty for trade (integer ≥ 1, null = none)
// Admin-cookie gated. Pricing is IDR-canonical end-to-end for the retail
// channel — no FX conversion in the admin path. The trade channel is GBP-
// canonical because UK trade buyers quote in GBP and that's the column the
// owner edits directly. MY/VN visitors see the parent IDR price FX-converted
// at render time.

import { NextResponse, type NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { ADMIN_COOKIE, verifyAdminCookie } from "@/lib/adminAuth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const cookie = req.cookies.get(ADMIN_COOKIE)?.value;
  if (!verifyAdminCookie(cookie)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await ctx.params;
  if (!id) return NextResponse.json({ ok: false, error: "Missing id" }, { status: 400 });

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Bad request" }, { status: 400 });
  }

  const updates: Record<string, unknown> = {};
  let priceIdrAfter: number | null = null;

  if (body.price_idr !== undefined) {
    const priceIdr = Number(body.price_idr);
    if (!Number.isFinite(priceIdr) || priceIdr < 0) {
      return NextResponse.json({ ok: false, error: "price_idr must be a non-negative number." }, { status: 400 });
    }
    priceIdrAfter = Math.round(priceIdr);
    updates.price_idr = priceIdrAfter;
  }
  if (body.free_uk_delivery !== undefined) {
    updates.shipping_per_unit_idr = body.free_uk_delivery === true ? 0 : null;
  }

  if (body.price_idr_sea !== undefined) {
    const seaIdr = Number(body.price_idr_sea);
    if (!Number.isFinite(seaIdr) || seaIdr < 0) {
      return NextResponse.json({ ok: false, error: "price_idr_sea must be a non-negative number." }, { status: 400 });
    }
    updates.price_idr_sea = Math.round(seaIdr);
  }
  if (body.free_shipping_sea !== undefined) {
    updates.free_shipping_sea = body.free_shipping_sea === true;
  }

  if (body.trade_price_gbp !== undefined) {
    if (body.trade_price_gbp === null || body.trade_price_gbp === "") {
      updates.trade_price_gbp = null;
    } else {
      const tradeGbp = Number(body.trade_price_gbp);
      if (!Number.isFinite(tradeGbp) || tradeGbp <= 0) {
        return NextResponse.json({ ok: false, error: "trade_price_gbp must be > 0 or null." }, { status: 400 });
      }
      updates.trade_price_gbp = Math.round(tradeGbp * 100) / 100;
    }
  }

  if (body.moq !== undefined) {
    if (body.moq === null || body.moq === "") {
      updates.moq = null;
    } else {
      const moq = Number(body.moq);
      if (!Number.isInteger(moq) || moq < 1) {
        return NextResponse.json({ ok: false, error: "moq must be an integer ≥ 1 or null." }, { status: 400 });
      }
      updates.moq = moq;
    }
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ ok: false, error: "No fields to update." }, { status: 400 });
  }

  const upd = await supabaseAdmin
    .from("hammerex_products")
    .update(updates)
    .eq("id", id)
    .select("id, slug, price_idr, shipping_per_unit_idr, price_idr_sea, free_shipping_sea, trade_price_gbp, moq")
    .single();

  if (upd.error || !upd.data) {
    return NextResponse.json({ ok: false, error: upd.error?.message ?? "Not found" }, { status: 404 });
  }

  // Re-align multi-buy deal totals when the canonical IDR price moves. SEA
  // deal scaling happens in the resolver at read time — no stored row
  // changes needed when the SEA price moves.
  if (priceIdrAfter !== null) {
    await Promise.all([
      supabaseAdmin
        .from("hammerex_product_deals")
        .update({ price_idr: Math.round(upd.data.price_idr * 2 * 0.90) })
        .eq("product_id", id)
        .eq("qty", 2),
      supabaseAdmin
        .from("hammerex_product_deals")
        .update({ price_idr: Math.round(upd.data.price_idr * 3 * 0.85) })
        .eq("product_id", id)
        .eq("qty", 3)
    ]);
  }

  if (upd.data.slug) revalidatePath(`/product/${upd.data.slug}`);
  revalidatePath("/", "layout");

  return NextResponse.json({
    ok: true,
    price_idr: upd.data.price_idr,
    shipping_per_unit_idr: upd.data.shipping_per_unit_idr,
    price_idr_sea: upd.data.price_idr_sea,
    free_shipping_sea: upd.data.free_shipping_sea,
    trade_price_gbp: upd.data.trade_price_gbp,
    moq: upd.data.moq
  });
}
