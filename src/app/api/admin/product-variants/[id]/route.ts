// POST /api/admin/product-variants/[id]
// Body (subset optional):
//   price_idr:        number → canonical UK/RoW variant IDR price (stored as-is)
//   price_idr_sea:    number → raw IDR override for SEA visitors (0 = inherit parent)
//   trade_price_gbp:  number | null → variant-level trade GBP price (null inherits parent)
//   moq:              number | null → variant-level MOQ (integer ≥ 1, null inherits parent)
// Admin-cookie gated. IDR-canonical end-to-end for retail; trade channel is
// GBP-canonical. Variants don't carry a shipping override or a SEA shipping
// toggle — those stay on the parent product row.

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

  if (body.price_idr !== undefined) {
    const priceIdr = Number(body.price_idr);
    if (!Number.isFinite(priceIdr) || priceIdr < 0) {
      return NextResponse.json({ ok: false, error: "price_idr must be a non-negative number." }, { status: 400 });
    }
    updates.price_idr = Math.round(priceIdr);
  }

  if (body.price_idr_sea !== undefined) {
    const seaIdr = Number(body.price_idr_sea);
    if (!Number.isFinite(seaIdr) || seaIdr < 0) {
      return NextResponse.json({ ok: false, error: "price_idr_sea must be a non-negative number." }, { status: 400 });
    }
    updates.price_idr_sea = Math.round(seaIdr);
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
    .from("hammerex_product_variants")
    .update(updates)
    .eq("id", id)
    .select("id, price_idr, price_idr_sea, trade_price_gbp, moq, product_id, hammerex_products!inner(slug)")
    .single();

  if (upd.error || !upd.data) {
    return NextResponse.json({ ok: false, error: upd.error?.message ?? "Not found" }, { status: 404 });
  }

  const parent = (upd.data as unknown as { hammerex_products: { slug: string | null } }).hammerex_products;
  if (parent?.slug) revalidatePath(`/product/${parent.slug}`);
  revalidatePath("/", "layout");

  return NextResponse.json({
    ok: true,
    price_idr: upd.data.price_idr,
    price_idr_sea: upd.data.price_idr_sea,
    trade_price_gbp: upd.data.trade_price_gbp,
    moq: upd.data.moq
  });
}
