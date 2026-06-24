// /trade/cart — Step 1 of the 3-step trade checkout wizard.
//
// Server component: fetches the buyer's cart lines, hydrates each with the
// current product/variant snapshot (image, name, sku, trade_price_gbp,
// moq), computes line totals + subtotal in GBP (canonical trade currency),
// and renders the editable table via CartClient.
//
// Read path goes directly through supabaseAdmin (service-role) since the
// Agent-A POST endpoint may not be live yet. The client-side edit/remove
// hits dedicated /api/trade/cart/[id] handlers (also Agent A's scope) —
// CartClient gracefully falls back to optimistic-only behaviour and
// reloads the page on save if those endpoints aren't there yet.

import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Header } from "@/components/Header";
import { DeliveryFooter } from "@/components/DeliveryFooter";
import { getCurrentTradeAccount } from "@/lib/trade-auth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { FX, type Currency } from "@/lib/fx";
import { CartClient, type CartLineView } from "./CartClient";

export const metadata: Metadata = {
  title: "Trade cart",
  description: "Review your wholesale order before requesting a freight-confirmed quote.",
  robots: { index: false, follow: false }
};

export const dynamic = "force-dynamic";

type CartRow = {
  id: string;
  product_id: string;
  variant_id: string | null;
  size: string | null;
  thread_color: string | null;
  qty: number;
  added_at: string;
};

type ProductRow = {
  id: string;
  name: string;
  slug: string | null;
  sku: string | null;
  image_url: string | null;
  trade_price_gbp: number | null;
  moq: number | null;
};

type VariantRow = {
  id: string;
  product_id: string;
  label: string;
  sku: string | null;
  image_url: string | null;
  trade_price_gbp: number | null;
  moq: number | null;
};

export default async function TradeCartPage({
  searchParams
}: {
  searchParams: Promise<{ empty?: string }>;
}) {
  const sp = await searchParams;
  const showEmptyBanner = sp.empty === "1";
  const account = await getCurrentTradeAccount();
  if (!account) {
    // Middleware should already have 404'd anonymous visitors; this is a
    // belt-and-braces guard for the "logged-in but no active trade row" case.
    redirect("/trade");
  }

  const { data: rawCart } = await supabaseAdmin
    .from("hammerex_trade_cart_items")
    .select("id, product_id, variant_id, size, thread_color, qty, added_at")
    .eq("account_id", account.id)
    .order("added_at", { ascending: true });

  const cartRows = (rawCart ?? []) as CartRow[];

  const productIds = Array.from(new Set(cartRows.map((r) => r.product_id)));
  const variantIds = Array.from(
    new Set(cartRows.map((r) => r.variant_id).filter((v): v is string => !!v))
  );

  const [productsRes, variantsRes] = await Promise.all([
    productIds.length
      ? supabaseAdmin
          .from("hammerex_products")
          .select("id, name, slug, sku, image_url, trade_price_gbp, moq")
          .in("id", productIds)
      : Promise.resolve({ data: [] as ProductRow[] }),
    variantIds.length
      ? supabaseAdmin
          .from("hammerex_product_variants")
          .select("id, product_id, label, sku, image_url, trade_price_gbp, moq")
          .in("id", variantIds)
      : Promise.resolve({ data: [] as VariantRow[] })
  ]);

  const productsById = new Map<string, ProductRow>();
  for (const p of (productsRes.data ?? []) as ProductRow[]) productsById.set(p.id, p);
  const variantsById = new Map<string, VariantRow>();
  for (const v of (variantsRes.data ?? []) as VariantRow[]) variantsById.set(v.id, v);

  const lines: CartLineView[] = [];
  let subtotalGbp = 0;

  for (const row of cartRows) {
    const product = productsById.get(row.product_id);
    if (!product) continue; // Orphaned line — product deleted. Skip silently.
    const variant = row.variant_id ? variantsById.get(row.variant_id) : null;

    const unitPriceGbp =
      Number(variant?.trade_price_gbp ?? 0) ||
      Number(product.trade_price_gbp ?? 0) ||
      0;
    const moq = variant?.moq ?? product.moq ?? 1;
    const sku = variant?.sku ?? product.sku ?? "—";
    const image = variant?.image_url ?? product.image_url ?? null;
    const variantLabel = variant?.label ?? null;
    const lineTotalGbp = +(unitPriceGbp * row.qty).toFixed(2);
    subtotalGbp += lineTotalGbp;

    lines.push({
      id: row.id,
      product_id: row.product_id,
      variant_id: row.variant_id,
      product_name: product.name,
      product_slug: product.slug,
      sku,
      image_url: image,
      variant_label: variantLabel,
      size: row.size,
      thread_color: row.thread_color,
      qty: row.qty,
      moq,
      unit_price_gbp: unitPriceGbp,
      line_total_gbp: lineTotalGbp
    });
  }

  // Convert GBP subtotal to the buyer's display currency. GBP stays canonical
  // in storage; display is for the buyer's eyes only.
  const displayCurrency = ((account.currency as Currency) || "GBP") as Currency;
  // GBP→IDR via FX (perIDR is the inverse), then IDR→display via formatPrice.
  const subtotalIdr = Math.round(subtotalGbp / FX.GBP.perIDR);

  return (
    <>
      <Header />
      <main className="min-h-[60vh] bg-brand-bg px-4 py-8 sm:py-12">
        <div className="mx-auto max-w-6xl">
          <div className="mb-6 flex flex-col gap-1 sm:mb-8">
            <p className="text-xs font-semibold uppercase tracking-widest text-brand-accent">
              Trade portal · Step 1 of 3
            </p>
            <h1 className="text-2xl font-bold text-brand-text sm:text-3xl">
              Trade cart
            </h1>
            <p className="text-sm text-brand-muted">
              {account.company_name} · {account.trade_account_no}
            </p>
          </div>

          {showEmptyBanner && (
            <div
              role="alert"
              className="mb-5 rounded-xl border border-yellow-400/40 bg-yellow-400/10 px-4 py-3 text-xs text-yellow-200"
            >
              You can't continue to checkout with an empty cart — add some lines first.
            </div>
          )}

          <CartClient
            lines={lines}
            subtotalGbp={subtotalGbp}
            subtotalIdr={subtotalIdr}
            displayCurrency={displayCurrency}
          />
        </div>
      </main>
      <DeliveryFooter />
    </>
  );
}
