"use client";

// BulkGridView — dense flat table view of the trade catalogue, an
// alternative to the card-grid Agent A renders by default. Each product
// occupies one row; variants expand inline as indented sub-rows. Every
// row carries its own qty input (defaulting to MOQ) and an "Add" toggle.
//
// State is pure client-side until the user clicks the floating
// "Add N to cart" footer button — at which point we POST the selected
// rows to /api/trade/cart/bulk-add and render <BulkAddToast/> with the
// per-line result.
//
// We don't fetch independently: Agent A is the source of truth for the
// product list and hands it down via the `products` prop. This component
// is a presentation/state surface, not a data fetcher.

import { useMemo, useState } from "react";
import { BulkAddToast } from "./BulkAddToast";
import type {
  BulkAddLine,
  BulkAddResult,
  BulkGridProduct
} from "./bulkAddTypes";

type RowKey = string; // `${productId}` for product rows, `${productId}::${variantId}` for variants

type RowState = {
  qty: number;
  selected: boolean;
};

function rowKey(productId: string, variantId: string | null): RowKey {
  return variantId ? `${productId}::${variantId}` : productId;
}

function formatGbp(n: number | null): string {
  if (n == null) return "—";
  return `£${n.toFixed(2)}`;
}

export function BulkGridView({
  products
}: {
  products: BulkGridProduct[];
}) {
  // Per-row state keyed by rowKey. Initial qty = MOQ (or 1 if missing).
  const [rows, setRows] = useState<Record<RowKey, RowState>>(() => {
    const init: Record<RowKey, RowState> = {};
    for (const p of products) {
      init[rowKey(p.id, null)] = { qty: p.moq ?? 1, selected: false };
      for (const v of p.variants ?? []) {
        init[rowKey(p.id, v.id)] = { qty: v.moq ?? p.moq ?? 1, selected: false };
      }
    }
    return init;
  });

  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<BulkAddResult | null>(null);
  const [networkError, setNetworkError] = useState<string | null>(null);

  const updateRow = (key: RowKey, patch: Partial<RowState>) => {
    setRows((prev) => ({ ...prev, [key]: { ...prev[key]!, ...patch } }));
  };

  const selectedKeys = useMemo(
    () => Object.entries(rows).filter(([, s]) => s.selected && s.qty > 0).map(([k]) => k),
    [rows]
  );

  // Build a quick map back from rowKey → { sku, qty } for submission.
  const lines = useMemo<BulkAddLine[]>(() => {
    const out: BulkAddLine[] = [];
    for (const p of products) {
      const pKey = rowKey(p.id, null);
      const pState = rows[pKey];
      if (pState?.selected && p.sku && pState.qty > 0) {
        out.push({ sku: p.sku, qty: pState.qty });
      }
      for (const v of p.variants ?? []) {
        const vKey = rowKey(p.id, v.id);
        const vState = rows[vKey];
        if (vState?.selected && v.sku && vState.qty > 0) {
          out.push({ sku: v.sku, qty: vState.qty });
        }
      }
    }
    return out;
  }, [products, rows]);

  const submit = async () => {
    if (lines.length === 0) return;
    setSubmitting(true);
    setNetworkError(null);
    setResult(null);
    try {
      const res = await fetch("/api/trade/cart/bulk-add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lines })
      });
      if (!res.ok) {
        setNetworkError(
          res.status === 401
            ? "Session expired. Please sign in again."
            : `Server returned ${res.status}.`
        );
        setSubmitting(false);
        return;
      }
      const body = (await res.json()) as BulkAddResult;
      setResult(body);
      // Clear selections that successfully added so the buyer can continue.
      const addedSkus = new Set(body.added.map((r) => r.sku));
      setRows((prev) => {
        const next = { ...prev };
        for (const p of products) {
          if (p.sku && addedSkus.has(p.sku)) {
            const k = rowKey(p.id, null);
            next[k] = { ...next[k]!, selected: false };
          }
          for (const v of p.variants ?? []) {
            if (v.sku && addedSkus.has(v.sku)) {
              const k = rowKey(p.id, v.id);
              next[k] = { ...next[k]!, selected: false };
            }
          }
        }
        return next;
      });
    } catch (e) {
      setNetworkError((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="overflow-x-auto rounded-2xl border border-brand-line bg-brand-surface">
        <table className="w-full min-w-[640px] border-collapse text-xs">
          <thead className="sticky top-0 z-10 bg-brand-bg text-left">
            <tr className="text-brand-muted">
              <Th>Ref</Th>
              <Th>Product</Th>
              <Th className="text-right">MOQ</Th>
              <Th className="text-right">Trade £</Th>
              <Th className="text-right">Qty</Th>
              <Th className="text-center">Add</Th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => {
              const pKey = rowKey(p.id, null);
              const pState = rows[pKey]!;
              const hasVariants = (p.variants?.length ?? 0) > 0;
              return (
                <FragmentRows key={p.id}>
                  <BulkRow
                    refSku={p.sku}
                    name={p.name}
                    moq={p.moq}
                    tradePrice={p.trade_price_gbp}
                    state={pState}
                    onChange={(patch) => updateRow(pKey, patch)}
                    indent={false}
                    disabled={hasVariants}
                    hint={hasVariants ? "(pick a variant)" : undefined}
                  />
                  {(p.variants ?? []).map((v) => {
                    const vKey = rowKey(p.id, v.id);
                    const vState = rows[vKey]!;
                    return (
                      <BulkRow
                        key={v.id}
                        refSku={v.sku}
                        name={v.label ?? "Variant"}
                        moq={v.moq ?? p.moq}
                        tradePrice={v.trade_price_gbp ?? p.trade_price_gbp}
                        state={vState}
                        onChange={(patch) => updateRow(vKey, patch)}
                        indent={true}
                      />
                    );
                  })}
                </FragmentRows>
              );
            })}
            {products.length === 0 && (
              <tr>
                <td colSpan={6} className="p-6 text-center text-brand-muted">
                  No products in this view.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <BulkAddToast result={result} />

      {networkError && (
        <p
          role="alert"
          className="rounded-xl border border-red-500/40 bg-red-500/10 p-2 text-xs text-red-300"
        >
          {networkError}
        </p>
      )}

      {selectedKeys.length > 0 && (
        <div className="sticky bottom-4 z-20 mt-2 flex items-center justify-between gap-3 rounded-2xl border border-brand-line bg-brand-surface p-3 shadow-xl">
          <p className="text-xs text-brand-text">
            <strong>{selectedKeys.length}</strong> rows ready
          </p>
          <button
            type="button"
            onClick={() => void submit()}
            disabled={submitting || lines.length === 0}
            className="inline-flex h-11 items-center justify-center rounded-full bg-brand-accent px-6 text-xs font-bold uppercase tracking-widest text-black transition disabled:opacity-40 hover:opacity-90"
          >
            {submitting
              ? "Adding…"
              : `Add ${selectedKeys.length} to cart`}
          </button>
        </div>
      )}
    </div>
  );
}

function Th({
  children,
  className = ""
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <th
      scope="col"
      className={`border-b border-brand-line px-3 py-2 text-xs font-semibold uppercase tracking-widest ${className}`}
    >
      {children}
    </th>
  );
}

function BulkRow({
  refSku,
  name,
  moq,
  tradePrice,
  state,
  onChange,
  indent,
  disabled,
  hint
}: {
  refSku: string | null;
  name: string;
  moq: number | null;
  tradePrice: number | null;
  state: { qty: number; selected: boolean };
  onChange: (patch: { qty?: number; selected?: boolean }) => void;
  indent: boolean;
  disabled?: boolean;
  hint?: string;
}) {
  const cant = disabled || !refSku || tradePrice == null;
  return (
    <tr className="border-b border-brand-line/60 last:border-b-0">
      <td className={`px-3 py-2 font-mono text-brand-text ${indent ? "pl-8" : ""}`}>
        {refSku ?? "—"}
      </td>
      <td className="px-3 py-2 text-brand-text">
        {indent && <span className="text-brand-muted">↳ </span>}
        {name}
        {hint && <span className="ml-2 text-brand-muted">{hint}</span>}
      </td>
      <td className="px-3 py-2 text-right text-brand-text">{moq ?? 1}</td>
      <td className="px-3 py-2 text-right text-brand-text">
        {formatGbp(tradePrice)}
      </td>
      <td className="px-3 py-2 text-right">
        <input
          type="number"
          min={1}
          step={1}
          value={state.qty}
          onChange={(e) => {
            const next = Math.max(1, Math.floor(Number(e.target.value) || 1));
            onChange({ qty: next });
          }}
          disabled={cant}
          aria-label={`Quantity for ${refSku ?? name}`}
          className="h-9 w-20 rounded-lg border border-brand-line bg-brand-bg px-2 text-right text-xs text-brand-text focus:border-brand-accent focus:outline-none disabled:opacity-40"
        />
      </td>
      <td className="px-3 py-2 text-center">
        <input
          type="checkbox"
          checked={state.selected}
          onChange={(e) => onChange({ selected: e.target.checked })}
          disabled={cant}
          aria-label={`Select ${refSku ?? name} for bulk add`}
          className="h-4 w-4 accent-brand-accent disabled:opacity-40"
        />
      </td>
    </tr>
  );
}

// React doesn't let <tbody> have a <Fragment> with a key directly when the
// children are <tr>s in TS — this thin wrapper lets us group product+variant
// rows under one logical key without inserting a wrapper element.
function FragmentRows({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
