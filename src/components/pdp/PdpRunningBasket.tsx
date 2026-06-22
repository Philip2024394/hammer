"use client";

import { useEffect, useState } from "react";
import { cart, type CartLine } from "@/lib/cart";
import { formatPrice, type Currency } from "@/lib/fx";
import { threadColorLabel } from "@/lib/threadColor";
import type { HammerexProduct } from "@/lib/supabase";

// Live "In Cart Now" panel for the PDP. The current product is ALWAYS shown
// as the standard / first line (it represents the buyer's staged purchase
// for this page, with all currently-selected options reflected in the price).
// Any other items already in the cart from other PDPs are listed beneath.
// Every line gets a red delete button. Subscribes to cart events so adds /
// removes from anywhere on the page reflect instantly.
export function PdpRunningBasket({
  product,
  unitPriceIdr,
  currency,
  qty,
  onQtyChange,
  stockCap
}: {
  product: HammerexProduct;
  unitPriceIdr: number;
  currency: Currency;
  // Standard-line qty is driven by the same state as the main +/- next to
  // the BuyColumn price, so both controls stay in lockstep.
  qty: number;
  onQtyChange: (next: number) => void;
  // Upper bound for the standard row's qty. Falls back to 99 when not set.
  stockCap?: number | null;
}) {
  const [lines, setLines] = useState<CartLine[]>([]);
  // Local-only flag: lets the buyer dismiss the standard "current product"
  // row without affecting the actual cart. Resets on a fresh page load.
  const [currentDismissed, setCurrentDismissed] = useState(false);

  useEffect(() => {
    const refresh = () => setLines(cart.read());
    refresh();
    return cart.subscribe(refresh);
  }, []);

  // Other cart lines = everything in the cart that isn't this exact product.
  // Multiple cart lines for the same product (different variant/options) all
  // get separated under "Other items" — keeps the standard line unambiguous.
  const otherLines = lines.filter((l) => l.productId !== product.id);

  // Subtotal = the standard row (if still shown, scaled by its qty) + every
  // other cart line (each scaled by its own qty).
  const standardSubtotal = currentDismissed ? 0 : unitPriceIdr * qty;
  const otherSubtotal = otherLines.reduce((s, l) => s + l.unitPriceIdr * l.qty, 0);
  const subtotal = standardSubtotal + otherSubtotal;
  const stockMax = stockCap ?? 99;

  return (
    <div className="rounded-xl border border-brand-line bg-brand-surface p-4">
      <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-brand-text">
        In Cart Now
      </h3>

      <ul className="flex flex-col gap-2">
        {/* Standard row — the current product. Always rendered unless the
            buyer taps the red delete to dismiss it locally. Quantity is
            shared with the BuyColumn's main +/- via the qty + onQtyChange
            props, so the buyer can adjust here OR up there interchangeably. */}
        {!currentDismissed && (
          <li className="flex items-start gap-3 rounded-lg border border-brand-line bg-brand-bg p-2">
            <div className="block h-14 w-14 shrink-0 overflow-hidden rounded-md bg-black">
              {product.image_url && (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={product.image_url} alt={product.name} loading="lazy" className="h-full w-full object-contain p-1" />
              )}
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <span className="truncate text-xs font-semibold text-brand-text">
                {qty}× {product.name}
              </span>
              <span className="text-xs text-brand-muted">Standard · this page</span>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-bold text-brand-text">
                  {formatPrice(unitPriceIdr * qty, currency)}
                </span>
                <div className="inline-flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => onQtyChange(Math.max(1, qty - 1))}
                    aria-label={`Decrease quantity of ${product.name}`}
                    className="grid h-7 w-7 place-items-center rounded-full bg-brand-accent text-sm font-bold text-black shadow-[0_1px_4px_rgba(255,179,0,0.4)] transition active:scale-95 hover:opacity-90"
                  >−</button>
                  <span className="w-6 text-center text-xs font-bold text-brand-text" aria-live="polite">{qty}</span>
                  <button
                    type="button"
                    onClick={() => onQtyChange(Math.min(stockMax, qty + 1))}
                    aria-label={`Increase quantity of ${product.name}`}
                    className="grid h-7 w-7 place-items-center rounded-full bg-brand-accent text-sm font-bold text-black shadow-[0_1px_4px_rgba(255,179,0,0.4)] transition active:scale-95 hover:opacity-90"
                  >+</button>
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setCurrentDismissed(true)}
              aria-label={`Remove ${product.name} from basket`}
              className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-red-500 transition active:scale-95 hover:bg-red-500/10 hover:text-red-400"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M3 6h18" />
                <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                <path d="M10 11v6M14 11v6" />
              </svg>
            </button>
          </li>
        )}

        {/* Any other cart items the buyer added elsewhere on the page. */}
        {otherLines.map((l) => {
          const lineKey = `${l.productId}::${l.size ?? ""}::${l.threadColor ?? ""}::${l.variantId ?? ""}::${l.backpackStraps ? "bp1" : "bp0"}::${l.beltSize ?? ""}::${l.customBrandName ?? ""}::${l.repairCover ? "rc1" : "rc0"}::${l.beltUpgrade ?? ""}`;
          const meta = [
            l.variantLabel,
            l.size && `Size ${l.size}`,
            l.beltSize && `Belt ${l.beltSize}`,
            l.threadColor && `Thread ${threadColorLabel(l.threadColor)}`,
            l.beltUpgrade && `Belt upgrade: ${l.beltUpgrade}`,
            l.customBrandName && `Branded: "${l.customBrandName}"`,
            l.repairCover && "+ Hammerex Pro Trade Cover",
            l.backpackStraps && "+ Backpack straps"
          ].filter(Boolean).join(" · ");
          const lineCurrency = (l.baseCurrency as Currency | undefined) ?? currency;
          return (
            <li key={lineKey} className="flex items-start gap-3 rounded-lg border border-brand-line bg-brand-bg p-2">
              <a href={`/product/${l.slug}`} className="block h-14 w-14 shrink-0 overflow-hidden rounded-md bg-black">
                {l.image && (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={l.image} alt={l.name} loading="lazy" className="h-full w-full object-contain p-1" />
                )}
              </a>
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <a href={`/product/${l.slug}`} className="truncate text-xs font-semibold text-brand-text hover:text-brand-accent">
                  {l.qty}× {l.name}
                </a>
                {meta && (
                  <span className="line-clamp-2 text-xs text-brand-muted">{meta}</span>
                )}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-bold text-brand-text">
                    {formatPrice(l.unitPriceIdr * l.qty, lineCurrency)}
                  </span>
                  <div className="inline-flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => cart.setQty(
                        l.productId,
                        l.size,
                        l.threadColor,
                        l.variantId,
                        l.backpackStraps,
                        Math.max(1, l.qty - 1),
                        l.beltSize ?? null,
                        l.customBrandName ?? null,
                        l.repairCover ?? false,
                        l.beltUpgrade ?? null
                      )}
                      aria-label={`Decrease quantity of ${l.name}`}
                      className="grid h-7 w-7 place-items-center rounded-full bg-brand-accent text-sm font-bold text-black shadow-[0_1px_4px_rgba(255,179,0,0.4)] transition active:scale-95 hover:opacity-90"
                    >−</button>
                    <span className="w-6 text-center text-xs font-bold text-brand-text" aria-live="polite">{l.qty}</span>
                    <button
                      type="button"
                      onClick={() => cart.setQty(
                        l.productId,
                        l.size,
                        l.threadColor,
                        l.variantId,
                        l.backpackStraps,
                        Math.min(99, l.qty + 1),
                        l.beltSize ?? null,
                        l.customBrandName ?? null,
                        l.repairCover ?? false,
                        l.beltUpgrade ?? null
                      )}
                      aria-label={`Increase quantity of ${l.name}`}
                      className="grid h-7 w-7 place-items-center rounded-full bg-brand-accent text-sm font-bold text-black shadow-[0_1px_4px_rgba(255,179,0,0.4)] transition active:scale-95 hover:opacity-90"
                    >+</button>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => cart.remove(
                  l.productId,
                  l.size,
                  l.threadColor,
                  l.variantId,
                  l.backpackStraps,
                  l.beltSize ?? null,
                  l.customBrandName ?? null,
                  l.repairCover ?? false,
                  l.beltUpgrade ?? null
                )}
                aria-label={`Remove ${l.name} from basket`}
                className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-red-500 transition active:scale-95 hover:bg-red-500/10 hover:text-red-400"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M3 6h18" />
                  <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                  <path d="M10 11v6M14 11v6" />
                </svg>
              </button>
            </li>
          );
        })}
      </ul>

      <div className="mt-4 flex flex-col gap-3 border-t border-brand-line pt-3">
        <div className="flex items-baseline justify-between">
          <span className="text-xs font-bold uppercase tracking-widest text-brand-muted">Total</span>
          <span className="text-base font-bold text-brand-text">{formatPrice(subtotal, currency)}</span>
        </div>
        <p className="text-xs text-brand-muted">
          Dispatch / shipping confirmed by email or phone after checkout
        </p>
      </div>
    </div>
  );
}
