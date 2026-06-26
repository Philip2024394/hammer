// POST /api/trade-off/products/upsert
// Magic-link authenticated. Body: { slug, edit_token, product: { id?, ... } }.
// When id is present, UPDATE WHERE listing_id matches to prevent cross-listing
// tampering. Otherwise INSERT. All inputs sanitised — name 80, desc 1000,
// price non-neg int, gallery capped 3, compare_with capped 10 uuids.

import { NextResponse, type NextRequest } from "next/server";
import { timingSafeEqual } from "crypto";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

const UUID_RE = /^[0-9a-fA-F-]{36}$/;

function constantTimeEq(a: string, b: string): boolean {
  const aBuf = Buffer.from(a);
  const bBuf = Buffer.from(b);
  if (aBuf.length !== bBuf.length) return false;
  return timingSafeEqual(aBuf, bBuf);
}

function s(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}

function nonNegIntOrNull(v: unknown): number | null {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  if (!Number.isFinite(n) || n < 0) return null;
  return Math.round(n);
}

function nonNegInt(v: unknown): number {
  const n = Number(v);
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.round(n);
}

function arrStr(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v
    .filter((x) => typeof x === "string")
    .map((x) => (x as string).trim())
    .filter((x) => x.length > 0);
}

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const slug = s(body.slug);
  const token = s(body.edit_token);
  const productIn = (body.product && typeof body.product === "object" ? body.product : {}) as Record<string, unknown>;

  if (!slug || !token) {
    return NextResponse.json(
      { ok: false, error: "Missing slug or edit_token." },
      { status: 400 }
    );
  }

  const listing = await supabaseAdmin
    .from("hammerex_trade_off_listings")
    .select("id, edit_token")
    .eq("slug", slug)
    .maybeSingle();

  if (!listing.data) {
    return NextResponse.json({ ok: false, error: "Listing not found." }, { status: 404 });
  }
  if (!constantTimeEq(listing.data.edit_token, token)) {
    return NextResponse.json({ ok: false, error: "Invalid edit token." }, { status: 403 });
  }

  const name = s(productIn.name).slice(0, 80);
  if (!name) {
    return NextResponse.json(
      { ok: false, error: "Product name is required." },
      { status: 400 }
    );
  }

  const descriptionRaw = s(productIn.description);
  const description = descriptionRaw.length > 0 ? descriptionRaw.slice(0, 1000) : null;
  const price_pence = nonNegInt(productIn.price_pence);
  const stock_count = nonNegIntOrNull(productIn.stock_count);
  const dispatch_days = nonNegIntOrNull(productIn.dispatch_days);
  const cover_url_raw = s(productIn.cover_url);
  const cover_url = cover_url_raw.length > 0 ? cover_url_raw.slice(0, 600) : null;
  const gallery_urls = arrStr(productIn.gallery_urls)
    .map((u) => u.slice(0, 600))
    .slice(0, 3);
  const compare_with = arrStr(productIn.compare_with)
    .filter((id) => UUID_RE.test(id))
    .slice(0, 10);
  const statusRaw = s(productIn.status);
  const status: "live" | "archived" = statusRaw === "archived" ? "archived" : "live";
  const sort_order = nonNegInt(productIn.sort_order);

  const patch = {
    name,
    description,
    price_pence,
    stock_count,
    dispatch_days,
    cover_url,
    gallery_urls,
    compare_with,
    status,
    sort_order
  };

  const idRaw = s(productIn.id);
  if (idRaw) {
    if (!UUID_RE.test(idRaw)) {
      return NextResponse.json(
        { ok: false, error: "Invalid product id." },
        { status: 400 }
      );
    }
    const upd = await supabaseAdmin
      .from("hammerex_xrated_products")
      .update(patch)
      .eq("id", idRaw)
      .eq("listing_id", listing.data.id)
      .select("*")
      .maybeSingle();
    if (upd.error) {
      console.error("[trade-off/products/upsert] update failed:", upd.error);
      return NextResponse.json(
        { ok: false, error: upd.error.message },
        { status: 500 }
      );
    }
    if (!upd.data) {
      return NextResponse.json(
        { ok: false, error: "Product not found." },
        { status: 404 }
      );
    }
    return NextResponse.json({ ok: true, product: upd.data });
  }

  const ins = await supabaseAdmin
    .from("hammerex_xrated_products")
    .insert({ ...patch, listing_id: listing.data.id })
    .select("*")
    .maybeSingle();
  if (ins.error || !ins.data) {
    console.error("[trade-off/products/upsert] insert failed:", ins.error);
    return NextResponse.json(
      { ok: false, error: ins.error?.message ?? "Insert failed" },
      { status: 500 }
    );
  }
  return NextResponse.json({ ok: true, product: ins.data });
}
