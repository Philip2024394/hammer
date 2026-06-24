// POST /api/trade/orders
//
// Final commit of the 3-step trade checkout wizard. Reads the buyer's
// cart, snapshots prices + names, generates the next TRD-YYYY-NNNN order
// number, inserts the order + item rows, and clears the cart + draft.
//
// Concurrency notes:
//   - We compute order_number via MAX + 1. Two concurrent submits could in
//     theory collide on the unique constraint; we retry up to 3 times with
//     a fresh MAX query.
//   - Cart-read + insert + clear is not strictly transactional (PostgREST
//     doesn't expose multi-statement transactions). Risk is low because
//     a single trade account is one buyer; we mitigate by serializing the
//     cart-clear AFTER the order items insert. A failure between insert
//     and clear leaves the cart intact and the order in the DB — admin
//     can resolve by hand. The order is the durable artefact.
//
// Pricing:
//   - subtotal_gbp: sum of qty × current trade_price_gbp (variant overrides product)
//   - goods_idr_locked: subtotal_gbp / FX.GBP.perIDR — IDR canonical lock
//   - unit_price_gbp snapshotted per line; line_total_gbp computed by DB
//     trigger if present, else computed here as a fallback (we set it).

import { NextResponse, type NextRequest } from "next/server";
import { getCurrentTradeAccount } from "@/lib/trade-auth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { FX } from "@/lib/fx";
import { sendTradeOrderConfirmation } from "@/lib/trade-emails";

export const runtime = "nodejs";

type CartRow = {
  id: string;
  product_id: string;
  variant_id: string | null;
  size: string | null;
  thread_color: string | null;
  qty: number;
};

type ProductRow = {
  id: string;
  name: string;
  sku: string | null;
  trade_price_gbp: number | null;
};

type VariantRow = {
  id: string;
  product_id: string;
  label: string;
  sku: string | null;
  trade_price_gbp: number | null;
};

type DraftRow = {
  freight_mode: "air" | "sea" | null;
  incoterm: string | null;
  ship_to_address: string | null;
  ship_to_country: string | null;
  customer_notes: string | null;
};

async function nextOrderNumber(): Promise<string> {
  const year = new Date().getUTCFullYear();
  const prefix = `TRD-${year}-`;
  const { data } = await supabaseAdmin
    .from("hammerex_trade_orders")
    .select("order_number")
    .ilike("order_number", `${prefix}%`)
    .order("order_number", { ascending: false })
    .limit(1);
  let next = 1;
  if (data && data.length > 0) {
    const last = (data[0] as { order_number: string }).order_number;
    const tail = last.slice(prefix.length);
    const n = parseInt(tail, 10);
    if (Number.isFinite(n)) next = n + 1;
  }
  return `${prefix}${String(next).padStart(4, "0")}`;
}

export async function POST(req: NextRequest) {
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

  // Read the canonical draft as source of truth for freight + incoterm.
  // Body overrides for ship-to / notes are accepted (the buyer may edit on
  // the review page without round-tripping the draft first).
  const { data: draftRaw } = await supabaseAdmin
    .from("hammerex_trade_checkout_drafts")
    .select("freight_mode, incoterm, ship_to_address, ship_to_country, customer_notes")
    .eq("account_id", account.id)
    .maybeSingle();
  const draft = (draftRaw ?? null) as DraftRow | null;

  const freight_mode = draft?.freight_mode ?? null;
  const incoterm = draft?.incoterm ?? "FOB";

  if (!freight_mode) {
    return NextResponse.json(
      { ok: false, error: "Freight mode not selected" },
      { status: 400 }
    );
  }

  const ship_to_address =
    typeof body.ship_to_address === "string" && body.ship_to_address.trim().length > 0
      ? (body.ship_to_address as string).slice(0, 2000)
      : draft?.ship_to_address ?? null;

  if (!ship_to_address || ship_to_address.trim().length === 0) {
    return NextResponse.json(
      { ok: false, error: "Ship-to address is required" },
      { status: 400 }
    );
  }

  const ship_to_country =
    (typeof body.ship_to_country === "string" ? body.ship_to_country : draft?.ship_to_country) ??
    null;
  const customer_notes =
    (typeof body.customer_notes === "string" ? body.customer_notes : draft?.customer_notes) ??
    null;

  // Read the cart fresh from the DB — never trust the client to send line items.
  const { data: cartRaw } = await supabaseAdmin
    .from("hammerex_trade_cart_items")
    .select("id, product_id, variant_id, size, thread_color, qty")
    .eq("account_id", account.id);
  const cart = (cartRaw ?? []) as CartRow[];

  if (cart.length === 0) {
    return NextResponse.json({ ok: false, error: "Cart is empty" }, { status: 400 });
  }

  const productIds = Array.from(new Set(cart.map((r) => r.product_id)));
  const variantIds = Array.from(
    new Set(cart.map((r) => r.variant_id).filter((v): v is string => !!v))
  );

  const [productsRes, variantsRes] = await Promise.all([
    productIds.length
      ? supabaseAdmin
          .from("hammerex_products")
          .select("id, name, sku, trade_price_gbp")
          .in("id", productIds)
      : Promise.resolve({ data: [] as ProductRow[] }),
    variantIds.length
      ? supabaseAdmin
          .from("hammerex_product_variants")
          .select("id, product_id, label, sku, trade_price_gbp")
          .in("id", variantIds)
      : Promise.resolve({ data: [] as VariantRow[] })
  ]);

  const productsById = new Map<string, ProductRow>();
  for (const p of (productsRes.data ?? []) as ProductRow[]) productsById.set(p.id, p);
  const variantsById = new Map<string, VariantRow>();
  for (const v of (variantsRes.data ?? []) as VariantRow[]) variantsById.set(v.id, v);

  // Build snapshotted line items + subtotal.
  type ItemInsert = {
    order_id: string;
    product_id: string;
    variant_id: string | null;
    product_name_snapshot: string;
    sku_snapshot: string;
    size: string | null;
    thread_color: string | null;
    qty: number;
    unit_price_gbp: number;
    line_total_gbp: number;
  };
  const pendingItems: Omit<ItemInsert, "order_id">[] = [];
  let subtotal_gbp = 0;

  for (const row of cart) {
    const product = productsById.get(row.product_id);
    if (!product) continue;
    const variant = row.variant_id ? variantsById.get(row.variant_id) : null;

    const unit =
      Number(variant?.trade_price_gbp ?? 0) ||
      Number(product.trade_price_gbp ?? 0) ||
      0;
    const sku = variant?.sku ?? product.sku ?? "—";
    const product_name_snapshot = variant?.label
      ? `${product.name} — ${variant.label}`
      : product.name;
    const lineTotal = +(unit * row.qty).toFixed(2);
    subtotal_gbp += lineTotal;

    pendingItems.push({
      product_id: row.product_id,
      variant_id: row.variant_id,
      product_name_snapshot,
      sku_snapshot: sku,
      size: row.size,
      thread_color: row.thread_color,
      qty: row.qty,
      unit_price_gbp: unit,
      line_total_gbp: lineTotal
    });
  }

  subtotal_gbp = +subtotal_gbp.toFixed(2);

  if (pendingItems.length === 0) {
    return NextResponse.json(
      { ok: false, error: "Cart resolved to zero buyable lines (products may have been removed)" },
      { status: 400 }
    );
  }

  // IDR canonical lock at submit time. perIDR is GBP_PER_IDR — divide to
  // recover the IDR amount.
  const goods_idr_locked = Math.round(subtotal_gbp / FX.GBP.perIDR);

  // Insert order with retry on order_number collision.
  let order_id: string | null = null;
  let order_number: string | null = null;
  let attempts = 0;
  let lastErr: string | null = null;
  while (attempts < 3 && !order_id) {
    attempts += 1;
    const candidate = await nextOrderNumber();
    const { data: inserted, error } = await supabaseAdmin
      .from("hammerex_trade_orders")
      .insert({
        order_number: candidate,
        account_id: account.id,
        status: "submitted",
        freight_mode,
        incoterm,
        currency: "GBP",
        subtotal_gbp,
        goods_idr_locked,
        ship_to_country,
        ship_to_address,
        customer_notes
      })
      .select("id, order_number")
      .single();
    if (error) {
      lastErr = error.message;
      // Unique-violation on order_number — try again with a fresh MAX.
      if (!/duplicate|unique/i.test(error.message)) break;
      continue;
    }
    order_id = (inserted as { id: string }).id;
    order_number = (inserted as { order_number: string }).order_number;
  }

  if (!order_id || !order_number) {
    return NextResponse.json(
      { ok: false, error: lastErr ?? "Could not create order" },
      { status: 500 }
    );
  }

  const itemsToInsert: ItemInsert[] = pendingItems.map((p) => ({ ...p, order_id: order_id! }));
  const { error: itemErr } = await supabaseAdmin
    .from("hammerex_trade_order_items")
    .insert(itemsToInsert);
  if (itemErr) {
    // The order row is orphaned at this point — leave it so admin can see
    // the failure. We surface the error.
    return NextResponse.json(
      { ok: false, error: `Order created but items failed: ${itemErr.message}` },
      { status: 500 }
    );
  }

  // Clear the cart + draft. Failures here are non-fatal — the order is
  // safely persisted; worst case the buyer sees a phantom cart on next
  // visit and re-removes lines. Log nothing; the data is the truth.
  await Promise.allSettled([
    supabaseAdmin.from("hammerex_trade_cart_items").delete().eq("account_id", account.id),
    supabaseAdmin
      .from("hammerex_trade_checkout_drafts")
      .delete()
      .eq("account_id", account.id)
  ]);

  // Fire the two confirmation emails (admin + buyer). Never throws — failures
  // surface in hammerex_trade_email_log and the order succeeds either way.
  // Owner can manually re-send via /api/admin/trade-orders/[id]/resend-emails.
  void sendTradeOrderConfirmation(order_id);

  return NextResponse.json({
    ok: true,
    id: order_id,
    order_number
  });
}
