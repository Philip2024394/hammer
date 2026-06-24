// /trade/checkout/review — Step 3 of the 3-step trade checkout wizard.
//
// Server component: re-loads cart + draft, redirects back to /trade/cart
// if empty or back to /trade/checkout/freight if the buyer hasn't yet
// picked Air or Sea. Renders the read-only line table + ReviewSubmit
// client (ship-to address + notes + submit button).
//
// Ship-to address default: company_name + country (from the trade account).
// The buyer can edit before submit. Notes are optional.

import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Image from "next/image";
import { Header } from "@/components/Header";
import { DeliveryFooter } from "@/components/DeliveryFooter";
import { getCurrentTradeAccount } from "@/lib/trade-auth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { FX, formatPrice, type Currency } from "@/lib/fx";
import { ReviewSubmit } from "./ReviewSubmit";

export const metadata: Metadata = {
  title: "Review · Trade checkout",
  description: "Confirm your wholesale order before requesting a freight-confirmed quote.",
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
};

type ProductRow = {
  id: string;
  name: string;
  sku: string | null;
  image_url: string | null;
  trade_price_gbp: number | null;
};

type VariantRow = {
  id: string;
  product_id: string;
  label: string;
  sku: string | null;
  image_url: string | null;
  trade_price_gbp: number | null;
};

type DraftRow = {
  freight_mode: "air" | "sea" | null;
  incoterm: string | null;
  ship_to_address: string | null;
  ship_to_country: string | null;
  customer_notes: string | null;
};

export default async function TradeReviewPage() {
  const account = await getCurrentTradeAccount();
  if (!account) redirect("/trade");

  const [{ data: cart }, { data: draft }] = await Promise.all([
    supabaseAdmin
      .from("hammerex_trade_cart_items")
      .select("id, product_id, variant_id, size, thread_color, qty")
      .eq("account_id", account.id),
    supabaseAdmin
      .from("hammerex_trade_checkout_drafts")
      .select("freight_mode, incoterm, ship_to_address, ship_to_country, customer_notes")
      .eq("account_id", account.id)
      .maybeSingle()
  ]);

  const cartRows = (cart ?? []) as CartRow[];
  if (cartRows.length === 0) redirect("/trade/cart?empty=1");

  const draftRow = (draft ?? null) as DraftRow | null;
  if (!draftRow?.freight_mode) {
    redirect("/trade/checkout/freight");
  }

  const productIds = Array.from(new Set(cartRows.map((r) => r.product_id)));
  const variantIds = Array.from(
    new Set(cartRows.map((r) => r.variant_id).filter((v): v is string => !!v))
  );

  const [productsRes, variantsRes] = await Promise.all([
    productIds.length
      ? supabaseAdmin
          .from("hammerex_products")
          .select("id, name, sku, image_url, trade_price_gbp")
          .in("id", productIds)
      : Promise.resolve({ data: [] as ProductRow[] }),
    variantIds.length
      ? supabaseAdmin
          .from("hammerex_product_variants")
          .select("id, product_id, label, sku, image_url, trade_price_gbp")
          .in("id", variantIds)
      : Promise.resolve({ data: [] as VariantRow[] })
  ]);

  const productsById = new Map<string, ProductRow>();
  for (const p of (productsRes.data ?? []) as ProductRow[]) productsById.set(p.id, p);
  const variantsById = new Map<string, VariantRow>();
  for (const v of (variantsRes.data ?? []) as VariantRow[]) variantsById.set(v.id, v);

  let subtotalGbp = 0;
  const lines = cartRows.map((row) => {
    const product = productsById.get(row.product_id);
    const variant = row.variant_id ? variantsById.get(row.variant_id) : null;
    const unit =
      Number(variant?.trade_price_gbp ?? 0) ||
      Number(product?.trade_price_gbp ?? 0) ||
      0;
    const lineTotal = +(unit * row.qty).toFixed(2);
    subtotalGbp += lineTotal;
    return {
      id: row.id,
      name: product?.name ?? "Unknown product",
      sku: variant?.sku ?? product?.sku ?? "—",
      image: variant?.image_url ?? product?.image_url ?? null,
      variant_label: variant?.label ?? null,
      size: row.size,
      thread_color: row.thread_color,
      qty: row.qty,
      unit_price_gbp: unit,
      line_total_gbp: lineTotal
    };
  });
  subtotalGbp = +subtotalGbp.toFixed(2);

  const displayCurrency = ((account.currency as Currency) || "GBP") as Currency;
  const subtotalIdr = Math.round(subtotalGbp / FX.GBP.perIDR);

  // Default ship-to address — company name + country from the account.
  const defaultShipTo =
    draftRow.ship_to_address && draftRow.ship_to_address.trim().length > 0
      ? draftRow.ship_to_address
      : `${account.company_name}\n${account.country ?? ""}`.trim();
  const defaultShipToCountry = draftRow.ship_to_country ?? account.country ?? "";

  function fmtGbp(value: number) {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: "GBP",
      maximumFractionDigits: 2
    }).format(value);
  }

  function fmtDisplay(value: number) {
    if (displayCurrency === "GBP") return fmtGbp(value);
    return formatPrice(Math.round(value / FX.GBP.perIDR), displayCurrency);
  }

  return (
    <>
      <Header />
      <main className="min-h-[60vh] bg-brand-bg px-4 py-8 sm:py-12">
        <div className="mx-auto max-w-6xl">
          <div className="mb-6 flex flex-col gap-1 sm:mb-8">
            <p className="text-xs font-semibold uppercase tracking-widest text-brand-accent">
              Trade portal · Step 3 of 3
            </p>
            <h1 className="text-2xl font-bold text-brand-text sm:text-3xl">
              Review & submit
            </h1>
            <p className="text-sm text-brand-muted">
              Hammerex will confirm freight + final total within 24h.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
            <section className="space-y-6">
              {/* Freight + incoterm summary */}
              <div className="rounded-2xl border border-brand-line bg-brand-surface p-5">
                <p className="text-xs font-semibold uppercase tracking-widest text-brand-accent">
                  Freight & incoterm
                </p>
                <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <p className="text-brand-muted">Freight mode</p>
                    <p className="mt-1 text-sm font-semibold text-brand-text">
                      {draftRow.freight_mode === "air" ? "Air freight" : "Sea freight"}
                    </p>
                  </div>
                  <div>
                    <p className="text-brand-muted">Incoterm</p>
                    <p className="mt-1 text-sm font-semibold text-brand-text">
                      {draftRow.incoterm ?? "FOB"}
                    </p>
                  </div>
                </div>
                <a
                  href="/trade/checkout/freight"
                  className="mt-4 inline-block text-[11px] uppercase tracking-widest text-brand-accent underline-offset-2 hover:underline"
                >
                  Change
                </a>
              </div>

              {/* Read-only line table */}
              <div className="rounded-2xl border border-brand-line bg-brand-surface">
                <div className="border-b border-brand-line p-4">
                  <p className="text-xs font-semibold uppercase tracking-widest text-brand-accent">
                    {lines.length} {lines.length === 1 ? "line" : "lines"}
                  </p>
                </div>
                <ul className="divide-y divide-brand-line/60">
                  {lines.map((line) => (
                    <li key={line.id} className="flex gap-3 p-4">
                      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-brand-line bg-brand-bg">
                        {line.image && (
                          <Image
                            src={line.image}
                            alt={line.name}
                            fill
                            sizes="56px"
                            className="object-cover"
                          />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-brand-text">
                          {line.name}
                        </p>
                        <p className="text-xs text-brand-muted">
                          Ref: <span className="font-mono text-brand-text">{line.sku}</span>
                        </p>
                        {(line.variant_label || line.size || line.thread_color) && (
                          <p className="text-xs text-brand-muted">
                            {[line.variant_label, line.size, line.thread_color]
                              .filter(Boolean)
                              .join(" · ")}
                          </p>
                        )}
                      </div>
                      <div className="text-right text-xs">
                        <p className="text-brand-muted">
                          {line.qty} × {fmtGbp(line.unit_price_gbp)}
                        </p>
                        <p className="mt-0.5 font-mono text-sm font-semibold text-brand-text">
                          {fmtGbp(line.line_total_gbp)}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
                <div className="border-t border-brand-line p-4">
                  <a
                    href="/trade/cart"
                    className="text-[11px] uppercase tracking-widest text-brand-accent underline-offset-2 hover:underline"
                  >
                    Edit cart
                  </a>
                </div>
              </div>

              {/* Ship-to + notes (client) */}
              <ReviewSubmit
                defaultShipToAddress={defaultShipTo}
                defaultShipToCountry={defaultShipToCountry}
                defaultCustomerNotes={draftRow.customer_notes ?? ""}
              />
            </section>

            <aside className="lg:sticky lg:top-32 lg:self-start">
              <div className="rounded-2xl border border-brand-line bg-brand-surface p-5">
                <p className="text-xs font-semibold uppercase tracking-widest text-brand-accent">
                  Order summary
                </p>
                <div className="mt-3 space-y-2 text-xs">
                  <div className="flex justify-between text-brand-muted">
                    <span>Goods</span>
                    <span className="font-mono text-brand-text">
                      {fmtDisplay(subtotalGbp)}
                    </span>
                  </div>
                  <div className="flex justify-between text-brand-muted">
                    <span>Freight</span>
                    <span className="text-brand-text">Quoted within 24h</span>
                  </div>
                  <div className="my-2 border-t border-brand-line" />
                  <div className="flex justify-between">
                    <span className="text-brand-muted">Subtotal</span>
                    <span className="font-mono text-lg font-semibold text-brand-text">
                      {fmtDisplay(subtotalGbp)}
                    </span>
                  </div>
                </div>

                {displayCurrency !== "GBP" && (
                  <p className="mt-3 text-[11px] text-brand-muted">
                    Trade currency · {fmtGbp(subtotalGbp)}
                  </p>
                )}
                <p className="mt-1 text-[11px] text-brand-muted">
                  Locked in IDR at{" "}
                  <span className="font-mono text-brand-text">
                    {new Intl.NumberFormat("id-ID", {
                      style: "currency",
                      currency: "IDR",
                      maximumFractionDigits: 0
                    }).format(subtotalIdr)}
                  </span>
                </p>
              </div>
            </aside>
          </div>
        </div>
      </main>
      <DeliveryFooter />
    </>
  );
}
