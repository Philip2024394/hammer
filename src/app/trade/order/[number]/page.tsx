// /trade/order/[number] — Order detail / success page.
//
// Server component, read-only. Lands here straight after submit and is
// also linkable from any future "My orders" surface. Shows the full
// snapshotted line list, freight + incoterm choice, ship-to, current
// status (submitted / quoted / confirmed / dispatched / delivered /
// cancelled), and the locked IDR canonical value.
//
// 404 if the order doesn't belong to the signed-in trade account — we
// don't leak cross-tenant order numbers.

import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { Header } from "@/components/Header";
import { DeliveryFooter } from "@/components/DeliveryFooter";
import { getCurrentTradeAccount } from "@/lib/trade-auth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { FX, formatPrice, type Currency } from "@/lib/fx";

export const metadata: Metadata = {
  title: "Order · Trade portal",
  description: "Hammerex trade order detail.",
  robots: { index: false, follow: false }
};

export const dynamic = "force-dynamic";

type OrderRow = {
  id: string;
  order_number: string;
  account_id: string;
  status: string;
  freight_mode: string | null;
  incoterm: string | null;
  currency: string;
  subtotal_gbp: number;
  goods_idr_locked: number;
  freight_quote_gbp: number | null;
  total_gbp: number | null;
  ship_to_country: string | null;
  ship_to_address: string | null;
  customer_notes: string | null;
  submitted_at: string;
  quoted_at: string | null;
  confirmed_at: string | null;
  dispatched_at: string | null;
  delivered_at: string | null;
  cancelled_at: string | null;
};

type ItemRow = {
  id: string;
  product_name_snapshot: string;
  sku_snapshot: string;
  size: string | null;
  thread_color: string | null;
  qty: number;
  unit_price_gbp: number;
  line_total_gbp: number | null;
};

function fmtGbp(value: number) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: 2
  }).format(value);
}

function StatusBadge({ status }: { status: string }) {
  const tone =
    status === "submitted"
      ? "border-yellow-400/40 bg-yellow-400/10 text-yellow-200"
      : status === "quoted"
        ? "border-blue-400/40 bg-blue-400/10 text-blue-200"
        : status === "confirmed"
          ? "border-brand-accent/40 bg-brand-accent/10 text-brand-accent"
          : status === "dispatched"
            ? "border-purple-400/40 bg-purple-400/10 text-purple-200"
            : status === "delivered"
              ? "border-green-400/40 bg-green-400/10 text-green-200"
              : "border-red-500/40 bg-red-500/10 text-red-300";
  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-widest ${tone}`}
    >
      {status}
    </span>
  );
}

export default async function TradeOrderPage({
  params
}: {
  params: Promise<{ number: string }>;
}) {
  const account = await getCurrentTradeAccount();
  if (!account) redirect("/trade");

  const { number } = await params;

  const { data: orderRaw } = await supabaseAdmin
    .from("hammerex_trade_orders")
    .select(
      "id, order_number, account_id, status, freight_mode, incoterm, currency, subtotal_gbp, goods_idr_locked, freight_quote_gbp, total_gbp, ship_to_country, ship_to_address, customer_notes, submitted_at, quoted_at, confirmed_at, dispatched_at, delivered_at, cancelled_at"
    )
    .eq("order_number", number)
    .maybeSingle();

  const order = (orderRaw ?? null) as OrderRow | null;
  if (!order || order.account_id !== account.id) {
    notFound();
  }

  const { data: itemsRaw } = await supabaseAdmin
    .from("hammerex_trade_order_items")
    .select("id, product_name_snapshot, sku_snapshot, size, thread_color, qty, unit_price_gbp, line_total_gbp")
    .eq("order_id", order.id)
    .order("id", { ascending: true });
  const items = (itemsRaw ?? []) as ItemRow[];

  const displayCurrency = ((account.currency as Currency) || "GBP") as Currency;
  const fmtDisplay = (gbp: number) =>
    displayCurrency === "GBP"
      ? fmtGbp(gbp)
      : formatPrice(Math.round(gbp / FX.GBP.perIDR), displayCurrency);

  const submittedAt = new Date(order.submitted_at).toLocaleString("en-GB", {
    dateStyle: "medium",
    timeStyle: "short"
  });

  return (
    <>
      <Header />
      <main className="min-h-[60vh] bg-brand-bg px-4 py-8 sm:py-12">
        <div className="mx-auto max-w-4xl">
          {order.status === "submitted" && (
            <div className="mb-6 rounded-2xl border border-brand-accent/40 bg-brand-accent/10 p-5">
              <p className="text-xs font-semibold uppercase tracking-widest text-brand-accent">
                Order received
              </p>
              <p className="mt-2 text-sm text-brand-text">
                Thanks — Hammerex will email you the freight-confirmed total within 24h.
              </p>
              <p className="mt-1 text-xs text-brand-muted">
                Reference: <span className="font-mono text-brand-text">{order.order_number}</span>
              </p>
            </div>
          )}

          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 sm:mb-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-brand-accent">
                Trade order
              </p>
              <h1 className="text-2xl font-bold text-brand-text sm:text-3xl">
                {order.order_number}
              </h1>
              <p className="text-xs text-brand-muted">Submitted {submittedAt}</p>
            </div>
            <StatusBadge status={order.status} />
          </div>

          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
            <section className="space-y-6">
              {/* Freight */}
              <div className="rounded-2xl border border-brand-line bg-brand-surface p-5">
                <p className="text-xs font-semibold uppercase tracking-widest text-brand-accent">
                  Freight & incoterm
                </p>
                <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <p className="text-brand-muted">Freight mode</p>
                    <p className="mt-1 text-sm font-semibold text-brand-text">
                      {order.freight_mode === "air"
                        ? "Air freight"
                        : order.freight_mode === "sea"
                          ? "Sea freight"
                          : "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-brand-muted">Incoterm</p>
                    <p className="mt-1 text-sm font-semibold text-brand-text">
                      {order.incoterm ?? "—"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Ship-to */}
              <div className="rounded-2xl border border-brand-line bg-brand-surface p-5">
                <p className="text-xs font-semibold uppercase tracking-widest text-brand-accent">
                  Ship to
                </p>
                <pre className="mt-3 whitespace-pre-wrap font-sans text-sm text-brand-text">
                  {order.ship_to_address || "—"}
                </pre>
                {order.ship_to_country && (
                  <p className="mt-2 text-xs text-brand-muted">
                    Country: <span className="text-brand-text">{order.ship_to_country}</span>
                  </p>
                )}
              </div>

              {/* Notes */}
              {order.customer_notes && (
                <div className="rounded-2xl border border-brand-line bg-brand-surface p-5">
                  <p className="text-xs font-semibold uppercase tracking-widest text-brand-accent">
                    Your notes
                  </p>
                  <pre className="mt-3 whitespace-pre-wrap font-sans text-sm text-brand-text">
                    {order.customer_notes}
                  </pre>
                </div>
              )}

              {/* Items */}
              <div className="rounded-2xl border border-brand-line bg-brand-surface">
                <div className="border-b border-brand-line p-4">
                  <p className="text-xs font-semibold uppercase tracking-widest text-brand-accent">
                    {items.length} {items.length === 1 ? "line" : "lines"}
                  </p>
                </div>
                <ul className="divide-y divide-brand-line/60">
                  {items.map((item) => {
                    const lineTotal =
                      item.line_total_gbp != null
                        ? Number(item.line_total_gbp)
                        : +(Number(item.unit_price_gbp) * item.qty).toFixed(2);
                    return (
                      <li key={item.id} className="flex gap-3 p-4 text-xs">
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-brand-text">
                            {item.product_name_snapshot}
                          </p>
                          <p className="text-brand-muted">
                            Ref: <span className="font-mono text-brand-text">{item.sku_snapshot}</span>
                          </p>
                          {(item.size || item.thread_color) && (
                            <p className="text-brand-muted">
                              {[item.size, item.thread_color].filter(Boolean).join(" · ")}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-brand-muted">
                            {item.qty} × {fmtGbp(Number(item.unit_price_gbp))}
                          </p>
                          <p className="mt-0.5 font-mono text-sm font-semibold text-brand-text">
                            {fmtGbp(lineTotal)}
                          </p>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </section>

            <aside className="lg:sticky lg:top-32 lg:self-start">
              <div className="rounded-2xl border border-brand-line bg-brand-surface p-5">
                <p className="text-xs font-semibold uppercase tracking-widest text-brand-accent">
                  Totals
                </p>
                <div className="mt-3 space-y-2 text-xs">
                  <div className="flex justify-between text-brand-muted">
                    <span>Goods (GBP)</span>
                    <span className="font-mono text-brand-text">
                      {fmtGbp(Number(order.subtotal_gbp))}
                    </span>
                  </div>
                  <div className="flex justify-between text-brand-muted">
                    <span>Freight</span>
                    <span className="text-brand-text">
                      {order.freight_quote_gbp != null
                        ? fmtGbp(Number(order.freight_quote_gbp))
                        : "Quoted within 24h"}
                    </span>
                  </div>
                  <div className="my-2 border-t border-brand-line" />
                  <div className="flex justify-between">
                    <span className="text-brand-muted">Total</span>
                    <span className="font-mono text-sm font-semibold text-brand-text">
                      {order.total_gbp != null
                        ? fmtGbp(Number(order.total_gbp))
                        : "Pending"}
                    </span>
                  </div>
                </div>

                {displayCurrency !== "GBP" && (
                  <p className="mt-3 text-[11px] text-brand-muted">
                    Goods in {displayCurrency}: {fmtDisplay(Number(order.subtotal_gbp))}
                  </p>
                )}
                <p className="mt-1 text-[11px] text-brand-muted">
                  Locked in IDR at{" "}
                  <span className="font-mono text-brand-text">
                    {new Intl.NumberFormat("id-ID", {
                      style: "currency",
                      currency: "IDR",
                      maximumFractionDigits: 0
                    }).format(Number(order.goods_idr_locked))}
                  </span>
                </p>

                <a
                  href="/trade"
                  className="mt-5 inline-flex h-10 w-full items-center justify-center rounded-full border border-brand-line px-5 text-[11px] font-semibold uppercase tracking-widest text-brand-text transition hover:border-brand-accent hover:text-brand-accent"
                >
                  Back to trade home
                </a>
              </div>
            </aside>
          </div>
        </div>
      </main>
      <DeliveryFooter />
    </>
  );
}
