// /trade/checkout/freight — Step 2 of the 3-step trade checkout wizard.
//
// Server component: re-checks auth + cart non-emptiness, computes goods
// subtotal (so we can show the freight-band estimates), loads the current
// draft selection (if the buyer comes back to this step), and hands off
// to FreightChoice (client) for the Air / Sea picker + Incoterm dropdown.
//
// Empty cart → redirect back to /trade/cart with ?empty=1 so the cart page
// can flash an apologetic banner.

import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Header } from "@/components/Header";
import { DeliveryFooter } from "@/components/DeliveryFooter";
import { getCurrentTradeAccount } from "@/lib/trade-auth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { type Currency } from "@/lib/fx";
import { FreightChoice } from "./FreightChoice";

export const metadata: Metadata = {
  title: "Freight · Trade checkout",
  description: "Choose air or sea freight for your wholesale order.",
  robots: { index: false, follow: false }
};

export const dynamic = "force-dynamic";

type CartRow = {
  product_id: string;
  variant_id: string | null;
  qty: number;
};

type ProductRow = { id: string; trade_price_gbp: number | null };
type VariantRow = { id: string; trade_price_gbp: number | null };

type DraftRow = {
  freight_mode: "air" | "sea" | null;
  incoterm: string | null;
};

export default async function TradeFreightPage() {
  const account = await getCurrentTradeAccount();
  if (!account) redirect("/trade");

  const { data: cart } = await supabaseAdmin
    .from("hammerex_trade_cart_items")
    .select("product_id, variant_id, qty")
    .eq("account_id", account.id);
  const cartRows = (cart ?? []) as CartRow[];

  if (cartRows.length === 0) {
    redirect("/trade/cart?empty=1");
  }

  const productIds = Array.from(new Set(cartRows.map((r) => r.product_id)));
  const variantIds = Array.from(
    new Set(cartRows.map((r) => r.variant_id).filter((v): v is string => !!v))
  );

  const [productsRes, variantsRes, draftRes] = await Promise.all([
    productIds.length
      ? supabaseAdmin
          .from("hammerex_products")
          .select("id, trade_price_gbp")
          .in("id", productIds)
      : Promise.resolve({ data: [] as ProductRow[] }),
    variantIds.length
      ? supabaseAdmin
          .from("hammerex_product_variants")
          .select("id, trade_price_gbp")
          .in("id", variantIds)
      : Promise.resolve({ data: [] as VariantRow[] }),
    supabaseAdmin
      .from("hammerex_trade_checkout_drafts")
      .select("freight_mode, incoterm")
      .eq("account_id", account.id)
      .maybeSingle()
  ]);

  const productPriceById = new Map<string, number>();
  for (const p of (productsRes.data ?? []) as ProductRow[]) {
    productPriceById.set(p.id, Number(p.trade_price_gbp ?? 0));
  }
  const variantPriceById = new Map<string, number>();
  for (const v of (variantsRes.data ?? []) as VariantRow[]) {
    variantPriceById.set(v.id, Number(v.trade_price_gbp ?? 0));
  }

  let goodsGbp = 0;
  for (const row of cartRows) {
    const unit =
      (row.variant_id ? variantPriceById.get(row.variant_id) : 0) ||
      productPriceById.get(row.product_id) ||
      0;
    goodsGbp += unit * row.qty;
  }
  goodsGbp = +goodsGbp.toFixed(2);

  const draft = (draftRes.data ?? null) as DraftRow | null;
  const displayCurrency = ((account.currency as Currency) || "GBP") as Currency;
  const lineCount = cartRows.length;

  return (
    <>
      <Header />
      <main className="min-h-[60vh] bg-brand-bg px-4 py-8 sm:py-12">
        <div className="mx-auto max-w-6xl">
          <div className="mb-6 flex flex-col gap-1 sm:mb-8">
            <p className="text-xs font-semibold uppercase tracking-widest text-brand-accent">
              Trade portal · Step 2 of 3
            </p>
            <h1 className="text-2xl font-bold text-brand-text sm:text-3xl">
              Freight & incoterm
            </h1>
            <p className="text-sm text-brand-muted">
              {lineCount} {lineCount === 1 ? "line" : "lines"} · goods value{" "}
              <span className="font-mono text-brand-text">
                {new Intl.NumberFormat("en-GB", {
                  style: "currency",
                  currency: "GBP",
                  maximumFractionDigits: 2
                }).format(goodsGbp)}
              </span>
            </p>
          </div>

          <FreightChoice
            goodsGbp={goodsGbp}
            displayCurrency={displayCurrency}
            initialFreightMode={draft?.freight_mode ?? null}
            initialIncoterm={draft?.incoterm ?? null}
          />
        </div>
      </main>
      <DeliveryFooter />
    </>
  );
}
