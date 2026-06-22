// POST /api/admin/products/[id]
// Body: { price_gbp: number, free_uk_delivery: boolean }
// Admin-cookie gated. Converts £ → IDR using the canonical FX rate
// from src/lib/fx.ts (1 GBP = 23,827 IDR) and writes:
//   price_idr               = round(price_gbp × 23827)
//   shipping_per_unit_idr   = 0  when free_uk_delivery is true
//                             null otherwise (defaults back to the
//                             team-quote flow — the existing checkout
//                             logic routes free-UK items to Stripe and
//                             everything else through the quote queue).

import { NextResponse, type NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { ADMIN_COOKIE, verifyAdminCookie } from "@/lib/adminAuth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { FX } from "@/lib/fx";

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

  const priceGbp = Number(body.price_gbp);
  if (!Number.isFinite(priceGbp) || priceGbp < 0) {
    return NextResponse.json({ ok: false, error: "Price must be a non-negative number." }, { status: 400 });
  }
  const freeUk = body.free_uk_delivery === true;

  // 1 GBP × perIDR⁻¹ = IDR. perIDR is stored as IDR→GBP factor (1/23827).
  const idrPerGbp = 1 / FX.GBP.perIDR;
  const price_idr = Math.round(priceGbp * idrPerGbp);

  const upd = await supabaseAdmin
    .from("hammerex_products")
    .update({
      price_idr,
      shipping_per_unit_idr: freeUk ? 0 : null
    })
    .eq("id", id)
    .select("id, slug, price_idr, shipping_per_unit_idr")
    .single();

  if (upd.error || !upd.data) {
    return NextResponse.json({ ok: false, error: upd.error?.message ?? "Not found" }, { status: 404 });
  }

  // Purge ISR cache so the new price appears on the public site within
  // the next request — instead of waiting up to the 60s revalidate
  // window. The PDP is the priority; the layout-level purge covers home,
  // featured-product rows, and category pages that list this product.
  if (upd.data.slug) revalidatePath(`/product/${upd.data.slug}`);
  revalidatePath("/", "layout");

  return NextResponse.json({
    ok: true,
    price_idr: upd.data.price_idr,
    shipping_per_unit_idr: upd.data.shipping_per_unit_idr
  });
}
