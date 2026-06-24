"use client";

// AddToCartButton — posts a single line to /api/trade/cart and tells the
// parent whether the qty was bumped to MOQ.
//
// Keeps its own "loading" + "added" micro-state for the button label, but
// the visible toast/banner is owned by the catalogue's CatalogueClient
// (a single toast for the whole page, not one per card).

import { useState } from "react";

type AddedPayload = {
  qty_used: number;
  was_bumped: boolean;
  total_qty: number;
};

export function AddToCartButton({
  productId,
  variantId,
  size,
  threadColor,
  qty,
  moq,
  onAdded,
  onError,
  className,
  label = "Add to cart"
}: {
  productId: string;
  variantId?: string | null;
  size?: string | null;
  threadColor?: string | null;
  qty: number;
  moq: number;
  onAdded: (p: AddedPayload) => void;
  onError: (msg: string) => void;
  className?: string;
  label?: string;
}) {
  const [loading, setLoading] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  async function onClick() {
    setLoading(true);
    try {
      const res = await fetch("/api/trade/cart", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          product_id: productId,
          variant_id: variantId ?? null,
          size: size ?? null,
          thread_color: threadColor ?? null,
          qty
        })
      });
      const json = (await res.json().catch(() => ({}))) as Record<string, unknown>;
      if (!res.ok || !json.added) {
        // 400 + MOQ violation case is handled server-side via auto-bump;
        // any other 4xx/5xx surfaces as a friendly toast.
        const errMsg = typeof json.error === "string" ? json.error : `HTTP ${res.status}`;
        onError(errMsg.replace(/_/g, " "));
        setLoading(false);
        return;
      }
      onAdded({
        qty_used: Number(json.qty_used ?? qty),
        was_bumped: Boolean(json.was_bumped),
        total_qty: Number(json.total_qty ?? qty)
      });
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 1800);
    } catch (e) {
      onError((e as Error).message || "network");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className={
        className ??
        "grid h-11 w-full grid-cols-[1fr_auto] items-center gap-2 rounded-md bg-brand-accent px-3 text-xs font-bold uppercase tracking-wider text-black transition active:scale-[0.98] hover:opacity-90 disabled:opacity-50"
      }
    >
      <span>{justAdded ? "Added!" : loading ? "Adding…" : label}</span>
      <span aria-hidden="true">{justAdded ? "✓" : "→"}</span>
    </button>
  );
}
