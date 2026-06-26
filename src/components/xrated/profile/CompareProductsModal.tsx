"use client";

// Side-by-side compare modal. Opens from a ProductModal's "Compare"
// button. The anchor product (the one the customer opened) gets the
// yellow-bordered highlight so the eye always knows which column is
// "this one" vs "the alternatives".
//
// Siblings are pre-picked by the tradesperson on the dashboard
// (product.compare_with). Phase 1 supports 1-2 siblings — the modal
// scrolls horizontally on mobile if more are passed.

import { useEffect } from "react";
import type { HammerexXratedProduct } from "@/lib/supabase";
import { addItem, formatGbp } from "@/lib/xratedCart";

export function CompareProductsModal({
  anchor,
  siblings,
  slug,
  themeColor,
  onClose
}: {
  anchor: HammerexXratedProduct;
  siblings: HammerexXratedProduct[];
  slug: string;
  themeColor: string;
  onClose: () => void;
}) {
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const columns: Array<{ product: HammerexXratedProduct; isAnchor: boolean }> = [
    { product: anchor, isAnchor: true },
    ...siblings.map((p) => ({ product: p, isAnchor: false }))
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Compare products"
      className="fixed inset-0 z-[120] flex items-stretch justify-center bg-black/85 backdrop-blur sm:items-center sm:p-3"
      onClick={onClose}
    >
      <div
        className="relative flex w-full max-w-4xl flex-col overflow-hidden bg-white shadow-2xl ring-4 ring-[#FFB300] sm:max-h-[95vh] sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-neutral-200 bg-neutral-50 px-4 py-3 sm:px-5">
          <div>
            <p
              className="text-[10px] font-extrabold uppercase tracking-[0.22em]"
              style={{ color: "#FFB300" }}
            >
              Compare
            </p>
            <p className="mt-0.5 text-sm font-extrabold text-neutral-900">
              {columns.length} products side by side
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close compare"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-black/70 text-white shadow-lg transition hover:bg-black"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 sm:p-5">
          <div className="flex gap-3 overflow-x-auto pb-2 sm:grid sm:gap-4 sm:overflow-visible" style={gridStyle(columns.length)}>
            {columns.map(({ product, isAnchor }) => (
              <CompareColumn
                key={product.id}
                product={product}
                isAnchor={isAnchor}
                slug={slug}
                themeColor={themeColor}
                onAdded={onClose}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function gridStyle(count: number): React.CSSProperties {
  // Mobile = horizontal scroll-snap; desktop overrides to a grid via
  // the sm: utility — gridTemplateColumns inline only matters at >=sm.
  return {
    gridTemplateColumns: `repeat(${Math.min(count, 3)}, minmax(0, 1fr))`
  };
}

function CompareColumn({
  product,
  isAnchor,
  slug,
  themeColor,
  onAdded
}: {
  product: HammerexXratedProduct;
  isAnchor: boolean;
  slug: string;
  themeColor: string;
  onAdded: () => void;
}) {
  const outOfStock = product.stock_count !== null && product.stock_count <= 0;

  function handleAdd() {
    if (outOfStock) return;
    addItem(slug, {
      product_id: product.id,
      name: product.name,
      price_pence: product.price_pence,
      cover_url: product.cover_url
    });
    onAdded();
  }

  return (
    <div
      className={`flex w-[78%] shrink-0 flex-col gap-3 rounded-2xl border-2 bg-white p-3 sm:w-auto sm:p-4 ${
        isAnchor ? "shadow-md" : ""
      }`}
      style={{
        borderColor: isAnchor ? themeColor : "#E5E7EB"
      }}
    >
      {isAnchor && (
        <span
          className="self-start rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-widest text-neutral-900"
          style={{ background: themeColor }}
        >
          You opened this
        </span>
      )}
      <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-neutral-100">
        {product.cover_url ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={product.cover_url}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-neutral-400">
            No image
          </div>
        )}
      </div>
      <p className="line-clamp-2 text-[13px] font-extrabold leading-tight text-neutral-900 sm:text-sm">
        {product.name}
      </p>
      <p className="text-lg font-extrabold text-neutral-900">
        {formatGbp(product.price_pence)}
      </p>
      <dl className="flex flex-col gap-1.5 text-[13px]">
        <Row label="Stock" value={stockLabel(product.stock_count)} />
        <Row
          label="Dispatch"
          value={
            typeof product.dispatch_days === "number" && product.dispatch_days > 0
              ? `${product.dispatch_days} ${product.dispatch_days === 1 ? "day" : "days"}`
              : "On enquiry"
          }
        />
        {product.description && (
          <div className="flex flex-col gap-1 pt-1">
            <dt className="text-[11px] font-bold uppercase tracking-widest text-neutral-400">
              Notes
            </dt>
            <dd className="line-clamp-4 text-[13px] leading-relaxed text-neutral-700">
              {product.description}
            </dd>
          </div>
        )}
      </dl>
      <button
        type="button"
        onClick={handleAdd}
        disabled={outOfStock}
        className="mt-auto inline-flex h-11 items-center justify-center gap-1.5 rounded-xl text-[13px] font-extrabold uppercase tracking-wider text-white shadow-lg transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
        style={{
          background: outOfStock ? "#737373" : "#0F7A3F",
          boxShadow: outOfStock ? undefined : "0 6px 18px rgba(15,122,63,0.4)"
        }}
      >
        {outOfStock ? "Out of stock" : "Add to enquiry"}
      </button>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-2 border-t border-neutral-100 pt-1.5">
      <dt className="text-[11px] font-bold uppercase tracking-widest text-neutral-400">
        {label}
      </dt>
      <dd className="text-right text-[13px] font-bold text-neutral-900">
        {value}
      </dd>
    </div>
  );
}

function stockLabel(stock: number | null): string {
  if (stock === null) return "On enquiry";
  if (stock <= 0) return "Out of stock";
  if (stock <= 5) return `${stock} left`;
  return "In stock";
}
