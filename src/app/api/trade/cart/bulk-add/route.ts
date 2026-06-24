// POST /api/trade/cart/bulk-add
//
// Bulk-add endpoint backing the QuickOrderBar (paste-a-list) and
// BulkGridView (dense flat table) UI on the trade catalogue. The shape:
//
//   Request:  { lines: [{ sku: string, qty: number }, ...] }
//   Response: {
//     added:     [{ sku, qty_used, was_bumped, moq }],
//     not_found: [string],
//     invalid:   [string]
//   }
//
// Logic:
//   1. Auth via getCurrentTradeAccount — 401 if no active trade account.
//   2. Sanitize lines client-side data: drop empties, mark non-int / non-positive
//      qty as `invalid` (UI-side parsing already does this; we re-check defensively).
//   3. Look up ALL skus in two parallel queries (products + variants), build a map.
//   4. For each line: resolve to a product_id (+ optional variant_id),
//      auto-bump qty to MOQ if below, upsert into hammerex_trade_cart_items
//      with qty = existing + qty_used (additive — pasting a list twice doubles it,
//      which matches buyer intent for "add more of these to my cart").
//   5. Return per-sku result rows so the UI can render granular feedback.
//
// We deliberately do NOT 500 on unknown SKUs — buyers paste imperfect lists
// all the time, and a partial success with a clear "not found" list is the
// right UX. We DO 401 if the session is missing (the gate is binary).

import { NextResponse, type NextRequest } from "next/server";
import { getCurrentTradeAccount } from "@/lib/trade-auth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

type LineInput = { sku: string; qty: number };

type AddedRow = {
  sku: string;
  qty_used: number;
  was_bumped: boolean;
  moq: number;
};

type ProductRow = {
  id: string;
  sku: string | null;
  moq: number | null;
};

type VariantRow = {
  id: string;
  product_id: string;
  sku: string | null;
  moq: number | null;
  // Inherits MOQ from parent product when null
  hammerex_products: { moq: number | null } | { moq: number | null }[] | null;
};

export async function POST(req: NextRequest) {
  const account = await getCurrentTradeAccount();
  if (!account) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const rawLines = (body as { lines?: unknown })?.lines;
  if (!Array.isArray(rawLines)) {
    return NextResponse.json({ ok: false, error: "Missing lines[]" }, { status: 400 });
  }

  const validLines: LineInput[] = [];
  const invalid: string[] = [];

  for (const raw of rawLines) {
    if (!raw || typeof raw !== "object") {
      invalid.push(String(raw ?? ""));
      continue;
    }
    const sku = String((raw as { sku?: unknown }).sku ?? "").trim();
    const qtyNum = Number((raw as { qty?: unknown }).qty);
    if (!sku) {
      invalid.push(sku);
      continue;
    }
    if (!Number.isInteger(qtyNum) || qtyNum < 1) {
      invalid.push(sku);
      continue;
    }
    validLines.push({ sku, qty: qtyNum });
  }

  if (validLines.length === 0) {
    return NextResponse.json({ added: [], not_found: [], invalid });
  }

  const skus = Array.from(new Set(validLines.map((l) => l.sku)));

  // Two-step lookup: products first, then variants for whatever didn't match.
  // Variants need to join their parent product so we know the product_id AND
  // can fall back to the parent's MOQ when the variant's own MOQ is null.
  const [productsRes, variantsRes] = await Promise.all([
    supabaseAdmin
      .from("hammerex_products")
      .select("id, sku, moq")
      .in("sku", skus),
    supabaseAdmin
      .from("hammerex_product_variants")
      .select("id, product_id, sku, moq, hammerex_products!inner(moq)")
      .in("sku", skus)
  ]);

  const productBySku = new Map<string, ProductRow>();
  for (const p of (productsRes.data ?? []) as ProductRow[]) {
    if (p.sku) productBySku.set(p.sku, p);
  }

  const variantBySku = new Map<
    string,
    { id: string; product_id: string; moq: number | null }
  >();
  for (const v of (variantsRes.data ?? []) as VariantRow[]) {
    if (!v.sku) continue;
    // Supabase returns the related row as either an object or a single-element
    // array depending on the FK shape — normalise it.
    const parent = Array.isArray(v.hammerex_products)
      ? v.hammerex_products[0]
      : v.hammerex_products;
    const inheritedMoq = v.moq ?? parent?.moq ?? null;
    variantBySku.set(v.sku, {
      id: v.id,
      product_id: v.product_id,
      moq: inheritedMoq
    });
  }

  const added: AddedRow[] = [];
  const not_found: string[] = [];

  // Cart key is (account_id, product_id, variant_id) — we want pasting the
  // same SKU twice in one paste to coalesce, so accumulate per-key first.
  type CartKey = { product_id: string; variant_id: string | null; moq: number };
  const pendingByKey = new Map<string, CartKey & { qty_to_add: number; sku: string }>();

  for (const line of validLines) {
    const variant = variantBySku.get(line.sku);
    const product = productBySku.get(line.sku);

    let product_id: string;
    let variant_id: string | null;
    let moq: number;

    if (variant) {
      product_id = variant.product_id;
      variant_id = variant.id;
      moq = variant.moq ?? 1;
    } else if (product) {
      product_id = product.id;
      variant_id = null;
      moq = product.moq ?? 1;
    } else {
      not_found.push(line.sku);
      continue;
    }

    const qty_used = Math.max(line.qty, moq);
    const was_bumped = line.qty < moq;

    added.push({ sku: line.sku, qty_used, was_bumped, moq });

    const key = `${product_id}::${variant_id ?? ""}`;
    const existing = pendingByKey.get(key);
    if (existing) {
      existing.qty_to_add += qty_used;
    } else {
      pendingByKey.set(key, {
        product_id,
        variant_id,
        moq,
        qty_to_add: qty_used,
        sku: line.sku
      });
    }
  }

  // Fetch existing cart rows for these keys so we can do additive updates.
  // Postgres has no clean "upsert with qty = qty + n" in a single PostgREST
  // call, so we read-then-write per key. Acceptable: bulk-add lists are
  // dozens of rows at most, and this endpoint is buyer-initiated (not hot).
  if (pendingByKey.size > 0) {
    const productIds = Array.from(
      new Set(Array.from(pendingByKey.values()).map((v) => v.product_id))
    );
    const { data: existingRows } = await supabaseAdmin
      .from("hammerex_trade_cart_items")
      .select("id, product_id, variant_id, qty")
      .eq("account_id", account.id)
      .in("product_id", productIds);

    const existingByKey = new Map<string, { id: string; qty: number }>();
    for (const row of (existingRows ?? []) as Array<{
      id: string;
      product_id: string;
      variant_id: string | null;
      qty: number;
    }>) {
      const key = `${row.product_id}::${row.variant_id ?? ""}`;
      existingByKey.set(key, { id: row.id, qty: row.qty });
    }

    const toInsert: Array<{
      account_id: string;
      product_id: string;
      variant_id: string | null;
      qty: number;
    }> = [];
    // Supabase query builders are PromiseLike, not Promise — wrap each
    // in an awaitable Promise.resolve() so Promise.all is happy.
    const updates: Array<PromiseLike<unknown>> = [];

    for (const [key, pending] of pendingByKey) {
      const prior = existingByKey.get(key);
      if (prior) {
        updates.push(
          supabaseAdmin
            .from("hammerex_trade_cart_items")
            .update({ qty: prior.qty + pending.qty_to_add })
            .eq("id", prior.id)
            .then((r) => r)
        );
      } else {
        toInsert.push({
          account_id: account.id,
          product_id: pending.product_id,
          variant_id: pending.variant_id,
          qty: pending.qty_to_add
        });
      }
    }

    if (toInsert.length > 0) {
      updates.push(
        supabaseAdmin
          .from("hammerex_trade_cart_items")
          .insert(toInsert)
          .then((r) => r)
      );
    }

    await Promise.all(updates);
  }

  return NextResponse.json({ added, not_found, invalid });
}
