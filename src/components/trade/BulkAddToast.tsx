"use client";

// Small inline feedback panel rendered after a bulk-add POST returns.
//
// Used by both QuickOrderBar (in-textarea feedback) and BulkGridView
// (after "Add N to cart"). Not a modal — it's a quiet stacked-row block
// that lives wherever the parent decides. Three rows max: added,
// MOQ-bumped, not-found. Each row only renders if its count > 0.

import type { BulkAddResult } from "./bulkAddTypes";

export function BulkAddToast({ result }: { result: BulkAddResult | null }) {
  if (!result) return null;

  const addedCount = result.added.length;
  const bumpedCount = result.added.filter((r) => r.was_bumped).length;
  const notFoundCount = result.not_found.length;
  const invalidCount = result.invalid.length;

  if (addedCount === 0 && notFoundCount === 0 && invalidCount === 0) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="mt-3 flex flex-col gap-1 rounded-xl border border-brand-line bg-brand-bg p-3 text-xs"
    >
      {addedCount > 0 && (
        <p className="flex items-center gap-2 text-brand-success">
          <span aria-hidden>{"✓"}</span>
          <span>
            Added <strong>{addedCount}</strong>{" "}
            {addedCount === 1 ? "line" : "lines"} to cart
          </span>
        </p>
      )}
      {bumpedCount > 0 && (
        <p className="flex items-start gap-2 text-yellow-300">
          <span aria-hidden>{"⚠"}</span>
          <span>
            <strong>{bumpedCount}</strong>{" "}
            {bumpedCount === 1 ? "line" : "lines"} bumped to MOQ:{" "}
            <span className="font-mono">
              {result.added
                .filter((r) => r.was_bumped)
                .map((r) => `${r.sku} → ${r.qty_used}`)
                .join(", ")}
            </span>
          </span>
        </p>
      )}
      {notFoundCount > 0 && (
        <p className="flex items-start gap-2 text-red-400">
          <span aria-hidden>{"✗"}</span>
          <span>
            <strong>{notFoundCount}</strong>{" "}
            {notFoundCount === 1 ? "Ref" : "Refs"} not found:{" "}
            <span className="font-mono">{result.not_found.join(", ")}</span>
          </span>
        </p>
      )}
      {invalidCount > 0 && (
        <p className="flex items-start gap-2 text-red-400">
          <span aria-hidden>{"✗"}</span>
          <span>
            <strong>{invalidCount}</strong> invalid{" "}
            {invalidCount === 1 ? "line" : "lines"} (need: Ref qty):{" "}
            <span className="font-mono">{result.invalid.join(", ")}</span>
          </span>
        </p>
      )}
    </div>
  );
}
