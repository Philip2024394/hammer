"use client";

// Single product card in the trade catalogue grid. Priority order top-to-bottom:
//   1. Ref number (mono, tap-to-copy)
//   2. Square thumbnail
//   3. Title (2-line clamp)
//   4. Trade price (large, yellow, account currency)
//   5. RRP strikethrough + margin %
//   6. MOQ pill
//   7. Variants summary
//   8. Stock dot indicator
//   9. Qty stepper (default = MOQ)
//   10. Add button
//
// Add posts to the in-page AddToCartButton (a thin client wrapper around
// fetch). We pass the current qty + the onAdded callback so the parent can
// raise the "Added to cart" toast.

import { useState } from "react";
import { imageUrl } from "@/lib/imageUrl";
import type { Currency } from "@/lib/fx";
import { formatTradePrice, formatRrpForAccount, marginOffRrp } from "@/lib/trade-fx";
import type { TradeCatalogueProduct } from "./CatalogueClient";
import { AddToCartButton } from "./AddToCartButton";

export function TradeProductCard({
  product,
  accountCurrency,
  onAdded,
  onError
}: {
  product: TradeCatalogueProduct;
  accountCurrency: Currency;
  onAdded: (qty: number, bumped: boolean) => void;
  onError: (msg: string) => void;
}) {
  const moq = Math.max(1, product.moq ?? 1);
  const [qty, setQty] = useState<number>(moq);
  const [copied, setCopied] = useState(false);

  const variantsLabel = buildVariantsLabel(product);
  const stock = stockBucket(product.stock_count);
  const margin = marginOffRrp(product.trade_price_gbp, product.price_idr);

  function bump(delta: number) {
    setQty((q) => {
      const n = q + delta;
      if (n < moq) return moq;
      if (n > 99) return 99;
      return n;
    });
  }

  async function onCopyRef() {
    if (!product.sku) return;
    try {
      await navigator.clipboard.writeText(product.sku);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard write can fail (HTTP, iframe, etc.) — silently no-op.
    }
  }

  const productHref = product.slug ? `/product/${product.slug}` : "#";

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-brand-line bg-brand-surface transition hover:border-brand-accent/60">
      {/* Ref number (tap to copy) */}
      <div className="flex items-center justify-between gap-2 px-3 pt-3 sm:px-4 sm:pt-4">
        {product.sku ? (
          <button
            type="button"
            onClick={onCopyRef}
            title="Copy reference"
            className="font-mono text-xs text-brand-muted transition hover:text-brand-accent"
          >
            Ref: <span className="text-brand-text">{product.sku}</span>
            {copied && <span className="ml-1 text-brand-accent">copied</span>}
          </button>
        ) : (
          <span className="font-mono text-xs text-brand-muted">Ref: —</span>
        )}
        <MoqPill moq={moq} />
      </div>

      {/* Square thumbnail */}
      <a
        href={productHref}
        className="relative mt-2 block aspect-square w-full overflow-hidden bg-black"
        style={{ background: "radial-gradient(circle at center, rgb(255 179 0 / 0.08) 0%, rgb(0 0 0) 75%)" }}
      >
        {product.image_url && (
          <img
            src={imageUrl(product.image_url, 720) ?? product.image_url}
            srcSet={`${imageUrl(product.image_url, 360) ?? product.image_url} 360w, ${imageUrl(product.image_url, 720) ?? product.image_url} 720w`}
            sizes="(min-width: 1280px) 320px, (min-width: 640px) 45vw, 100vw"
            alt={product.name}
            loading="lazy"
            decoding="async"
            className="block h-full w-full object-contain transition-transform duration-500 group-hover:scale-[1.04]"
          />
        )}
      </a>

      <div className="flex flex-1 flex-col gap-2.5 p-3 sm:p-4">
        {/* Title */}
        <h3 className="line-clamp-2 text-sm font-bold uppercase leading-tight tracking-wide text-brand-text">
          <a href={productHref} className="hover:text-brand-accent">{product.name}</a>
        </h3>

        {/* Trade price + RRP */}
        <div>
          <div className="text-lg font-bold text-brand-accent sm:text-xl">
            {formatTradePrice(product.trade_price_gbp, accountCurrency)}
            <span className="ml-1 text-xs font-semibold text-brand-muted">/ unit</span>
          </div>
          <div className="mt-0.5 flex flex-wrap items-baseline gap-2 text-xs text-brand-muted">
            <span>
              RRP{" "}
              <span className="line-through">
                {formatRrpForAccount(product.price_idr, accountCurrency)}
              </span>
            </span>
            {margin != null && (
              <span className="font-semibold text-brand-success">
                −{margin}% off RRP
              </span>
            )}
          </div>
        </div>

        {/* Variants summary */}
        {variantsLabel && (
          <p className="text-xs text-brand-muted">
            {variantsLabel}
          </p>
        )}

        {/* Stock indicator */}
        <p className={`inline-flex items-center gap-1.5 text-xs font-semibold ${stock.color}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${stock.dot}`} />
          {stock.label}
        </p>

        {/* Qty stepper + Add */}
        <div className="mt-auto flex flex-col gap-2 pt-2">
          <div className="flex items-center justify-between gap-2 rounded-md border border-brand-line bg-brand-bg p-1">
            <button
              type="button"
              onClick={() => bump(-1)}
              disabled={qty <= moq}
              aria-label="Decrease quantity"
              className="grid h-9 w-9 place-items-center rounded-md text-base font-bold text-brand-text transition hover:bg-brand-accent/15 disabled:opacity-40"
            >
              −
            </button>
            <input
              type="number"
              inputMode="numeric"
              min={moq}
              max={99}
              value={qty}
              onChange={(e) => {
                const v = Math.floor(Number(e.target.value));
                if (!Number.isFinite(v)) return;
                setQty(Math.max(moq, Math.min(99, v)));
              }}
              className="h-9 w-14 bg-transparent text-center text-sm font-bold text-brand-text focus:outline-none"
            />
            <button
              type="button"
              onClick={() => bump(1)}
              disabled={qty >= 99}
              aria-label="Increase quantity"
              className="grid h-9 w-9 place-items-center rounded-md text-base font-bold text-brand-text transition hover:bg-brand-accent/15 disabled:opacity-40"
            >
              +
            </button>
          </div>

          <AddToCartButton
            productId={product.id}
            qty={qty}
            moq={moq}
            onAdded={({ qty_used, was_bumped }) => {
              if (was_bumped) setQty(qty_used);
              onAdded(qty_used, was_bumped);
            }}
            onError={onError}
          />
        </div>
      </div>
    </article>
  );
}

function MoqPill({ moq }: { moq: number }) {
  return (
    <span className="inline-flex items-center rounded-full border border-brand-accent bg-brand-accent/15 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-brand-accent">
      MOQ {moq}
    </span>
  );
}

function buildVariantsLabel(p: TradeCatalogueProduct): string | null {
  const parts: string[] = [];
  if (p.variants_count > 0) parts.push(`${p.variants_count} ${p.variants_count === 1 ? "variant" : "variants"}`);
  if (p.sizes_count > 0) parts.push(`${p.sizes_count} ${p.sizes_count === 1 ? "size" : "sizes"}`);
  if (p.has_thread_color) parts.push("colour options");
  if (parts.length === 0) return null;
  return parts.join(" · ");
}

function stockBucket(n: number): { label: string; color: string; dot: string } {
  if (n > 10) return { label: "In stock", color: "text-brand-success", dot: "bg-brand-success" };
  if (n >= 1) return { label: "Made to order", color: "text-brand-accent", dot: "bg-brand-accent" };
  return { label: "Backorder", color: "text-brand-muted", dot: "bg-brand-muted" };
}
