"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { cart, type CartLine } from "@/lib/cart";
import { formatPrice } from "@/lib/fx";
import { threadColorLabel } from "@/lib/threadColor";
import { WelcomeExitIntent } from "@/components/WelcomeExitIntent";
import { TIER_2_THRESHOLD_IDR, shippingForCart } from "@/lib/shipping";
import { CartProgressBar } from "@/components/cart/CartProgressBar";

export default function CartPage() {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [ready, setReady] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);

  useEffect(() => {
    const sync = () => setLines(cart.read());
    sync();
    setReady(true);
    return cart.subscribe(sync);
  }, []);

  const subtotal = lines.reduce((s, l) => s + l.unitPriceIdr * l.qty, 0);
  const shipping = shippingForCart(lines);
  const orderTotal = subtotal + shipping;
  const tier2Reached = subtotal >= TIER_2_THRESHOLD_IDR;
  const dominantCurrency = (lines.find((l) => l.baseCurrency && l.baseCurrency !== "IDR")?.baseCurrency ?? "IDR") as "IDR" | "USD" | "SGD" | "AUD" | "EUR" | "GBP";

  return (
    <main className="pb-[calc(72px+56px+env(safe-area-inset-bottom))] lg:pb-0">
      <WelcomeExitIntent />
      <Header />
      <section className="mx-auto max-w-4xl px-4 py-8">
        <h1 className="mb-3 text-2xl font-bold text-brand-text">Your cart</h1>

        <div
          className="hammerex-marquee-mask relative mb-6 overflow-hidden rounded-full border border-brand-accent/40 bg-brand-accent/5 py-2"
          aria-label="Air freight shipping offer"
        >
          <span
            className="hammerex-marquee-track px-4 text-xs font-semibold uppercase tracking-wider text-brand-accent"
            style={{ animationDuration: "60s" }}
          >
            ✈ Air freight shipments: add £50 or more to unlock flat-rate £20 shipping — the fastest, most efficient way to get your products.&nbsp;&nbsp;·&nbsp;&nbsp;
            ✈ Air freight shipments: add £50 or more to unlock flat-rate £20 shipping — the fastest, most efficient way to get your products.&nbsp;&nbsp;·&nbsp;&nbsp;
          </span>
        </div>

        {!ready ? null : lines.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-brand-line bg-brand-surface p-12 text-center">
            <p className="text-sm text-brand-text">Your cart is empty.</p>
            <a
              href="/"
              className="mt-4 inline-flex h-11 items-center rounded-full bg-brand-accent px-5 text-sm font-semibold text-black hover:opacity-90"
            >Continue shopping</a>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
            <ul className="flex flex-col gap-3">
              {lines.map((l) => (
                <li key={`${l.productId}::${l.size ?? ""}::${l.threadColor ?? ""}::${l.variantId ?? ""}::${l.backpackStraps ? "bp1" : "bp0"}`} className="flex gap-4 rounded-2xl border border-brand-line bg-brand-surface p-4">
                  <a href={`/product/${l.slug}`} className="block h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-black">
                    {l.image && <img src={l.image} alt={l.name} loading="lazy" decoding="async" width="96" height="96" className="h-full w-full object-contain" />}
                  </a>
                  <div className="flex flex-1 flex-col gap-2">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <a href={`/product/${l.slug}`} className="text-sm font-semibold text-brand-text hover:text-brand-accent">{l.name}</a>
                        {l.sku && <p className="text-xs font-semibold text-brand-accent">Ref: {l.sku}</p>}
                        {l.variantLabel === "WELCOME GIFT"
                          ? <p className="inline-flex items-center gap-1 rounded-full bg-brand-accent/15 px-2 py-0.5 text-xs font-bold uppercase tracking-widest text-brand-accent">🎁 Welcome gift</p>
                          : l.variantLabel === "DEAL BREAKER"
                            ? <p className="inline-flex items-center gap-1 rounded-full bg-brand-accent/15 px-2 py-0.5 text-xs font-bold uppercase tracking-widest text-brand-accent">⚡ Deal Breaker · 15% off</p>
                            : l.variantLabel && <p className="text-xs text-brand-muted">Option: {l.variantLabel}</p>}
                        {l.size && <p className="text-xs text-brand-muted">Size: {l.size}</p>}
                        {l.threadColor && <p className="text-xs text-brand-muted">Thread: {threadColorLabel(l.threadColor)}</p>}
                        {l.backpackStraps && <p className="text-xs text-brand-accent">+ Backpack straps add-on</p>}
                      </div>
                      <button
                        type="button"
                        onClick={() => cart.remove(l.productId, l.size, l.threadColor, l.variantId, l.backpackStraps)}
                        aria-label="Remove from cart"
                        className="grid h-11 w-11 place-items-center rounded-full text-brand-muted transition hover:bg-black/40 hover:text-brand-accent active:scale-95"
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M3 6h18" />
                          <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                          <path d="M10 11v6M14 11v6" />
                        </svg>
                      </button>
                    </div>
                    <div className="mt-auto flex items-center justify-between gap-3">
                      <div className="flex h-11 items-center rounded-full border border-brand-line bg-black">
                        <button
                          type="button"
                          onClick={() => cart.setQty(l.productId, l.size, l.threadColor, l.variantId, l.backpackStraps, l.qty - 1)}
                          aria-label="Decrease quantity"
                          className="grid h-11 w-11 place-items-center text-brand-text hover:text-brand-accent"
                        >−</button>
                        <span className="w-7 text-center text-xs font-semibold text-brand-text">{l.qty}</span>
                        <button
                          type="button"
                          onClick={() => cart.setQty(l.productId, l.size, l.threadColor, l.variantId, l.backpackStraps, l.qty + 1)}
                          aria-label="Increase quantity"
                          className="grid h-11 w-11 place-items-center text-brand-text hover:text-brand-accent"
                        >+</button>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-brand-text">
                          {l.unitPriceIdr === 0
                            ? <span className="text-brand-accent">FREE</span>
                            : l.baseCurrency && l.baseCurrency !== "IDR"
                              ? formatPrice(l.unitPriceIdr * l.qty, l.baseCurrency as any)
                              : formatPrice(l.unitPriceIdr * l.qty, "IDR")}
                        </div>
                        {l.qty > 1 && l.unitPriceIdr > 0 && (
                          <div className="text-xs text-brand-muted">
                            {l.qty} × {formatPrice(l.unitPriceIdr, "IDR")}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <aside className="h-fit rounded-2xl border border-brand-line bg-brand-surface p-5">
              <div className="mb-4">
                <CartProgressBar subtotalIdr={subtotal} />
              </div>
              <h2 className="text-sm font-semibold text-brand-text">Summary</h2>
              <dl className="mt-4 space-y-2">
                <div className="flex justify-between text-xs text-brand-muted">
                  <dt>Subtotal ({lines.reduce((s, l) => s + l.qty, 0)} items)</dt>
                  <dd className="text-brand-text">{formatPrice(subtotal, "IDR")}</dd>
                </div>
                <div className="flex justify-between text-xs text-brand-muted">
                  <dt>
                    Shipping{tier2Reached ? " (£20 flat)" : " (£28)"}
                  </dt>
                  <dd className="text-brand-text">
                    {formatPrice(shipping, "IDR")}
                  </dd>
                </div>
                <div className="my-1 border-t border-brand-line" />
                <div className="flex justify-between text-sm font-semibold">
                  <dt className="text-brand-text">Order total</dt>
                  <dd className="text-brand-accent">{formatPrice(orderTotal, "IDR")}</dd>
                </div>
              </dl>
              <p className="mt-3 text-xs leading-relaxed text-brand-muted">
                £20 flat shipping to UK, USA and Australia via EMS Air Mail. Dispatch within
                3 working days, 5–6 days transit. Shipping to other countries is confirmed
                on WhatsApp after checkout.
              </p>
              <div className="my-4 border-t border-brand-line" />
              <a
                href="/checkout"
                className="grid h-12 place-items-center rounded-full bg-brand-accent text-sm font-semibold text-black hover:opacity-90"
              >Proceed to checkout</a>
              <a
                href="/"
                className="mt-2 grid h-11 place-items-center rounded-full border border-brand-line bg-black text-xs font-semibold text-brand-text hover:border-brand-accent"
              >Continue shopping</a>
              {confirmClear ? (
                <div className="mt-2 rounded-full border border-brand-line bg-black/40 p-1.5">
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      onClick={() => setConfirmClear(false)}
                      className="grid h-10 place-items-center rounded-full text-xs font-semibold text-brand-muted hover:text-brand-text"
                    >Cancel</button>
                    <button
                      type="button"
                      onClick={() => { cart.clear(); setConfirmClear(false); }}
                      className="grid h-10 place-items-center rounded-full bg-red-500/80 text-xs font-bold uppercase tracking-widest text-white hover:opacity-90"
                    >Confirm clear</button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmClear(true)}
                  className="mt-2 grid h-11 w-full place-items-center rounded-full border border-brand-line text-xs font-semibold text-brand-muted hover:border-red-500/60 hover:text-red-300"
                >Clear cart</button>
              )}
            </aside>
          </div>
        )}
      </section>

      {ready && lines.length > 0 && (
        <div className="fixed inset-x-0 bottom-[calc(56px+env(safe-area-inset-bottom))] z-40 border-t border-brand-line bg-brand-bg/95 px-3 py-2 backdrop-blur lg:hidden">
          <div className="mx-auto flex max-w-4xl items-center gap-3">
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="text-xs text-brand-muted">{lines.reduce((s, l) => s + l.qty, 0)} item{lines.reduce((s, l) => s + l.qty, 0) === 1 ? "" : "s"}</span>
              <span className="truncate text-sm font-bold text-brand-text">
                {dominantCurrency !== "IDR" ? formatPrice(orderTotal, dominantCurrency) : formatPrice(orderTotal, "IDR")}
              </span>
            </div>
            <a
              href="/checkout"
              className="grid h-12 place-items-center rounded-full bg-brand-accent px-5 text-xs font-bold uppercase tracking-widest text-black transition active:scale-[0.98] hover:opacity-90"
            >Checkout →</a>
          </div>
        </div>
      )}
    </main>
  );
}
