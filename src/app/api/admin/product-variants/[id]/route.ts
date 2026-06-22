// POST /api/admin/product-variants/[id]
// Body: { price_gbp: number }
// Admin-cookie gated. Per-variant price set in £, stored as price_idr
// using the canonical FX rate from src/lib/fx.ts. Variants don't carry
// a shipping override — that stays on the parent product row.

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

  const idrPerGbp = 1 / FX.GBP.perIDR;
  const price_idr = Math.round(priceGbp * idrPerGbp);

  const upd = await supabaseAdmin
    .from("hammerex_product_variants")
    .update({ price_idr })
    .eq("id", id)
    .select("id, price_idr, product_id, hammerex_products!inner(slug)")
    .single();

  if (upd.error || !upd.data) {
    return NextResponse.json({ ok: false, error: upd.error?.message ?? "Not found" }, { status: 404 });
  }

  // Purge the parent PDP + layout-level pages so the new variant price
  // appears on the public site within the next request.
  const parent = (upd.data as unknown as { hammerex_products: { slug: string | null } }).hammerex_products;
  if (parent?.slug) revalidatePath(`/product/${parent.slug}`);
  revalidatePath("/", "layout");

  return NextResponse.json({ ok: true, price_idr: upd.data.price_idr });
}
