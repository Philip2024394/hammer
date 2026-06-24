"use client";

// QuickOrderBar — collapsed "+ Quick order" pill at the top of the trade
// catalogue. Click to expand into a paste-or-type textarea. Buyer enters
// lines like:
//
//   HX-PMB-001 12
//   HX-CLW-22 24
//   HX-PLS-08 6
//
// We split on newlines, then split each line on whitespace into [sku, qty].
// Lines that don't yield a positive integer qty are sent to the server as
// `invalid` so the response can call them out cleanly (and so the buyer can
// see exactly which line is malformed).
//
// Submission paths:
//   - Click "Add to cart"
//   - Cmd/Ctrl+Enter inside the textarea (power user shortcut)
//
// Feedback renders inline via <BulkAddToast/>. We do NOT modal-overlay
// anything; this is meant to feel like a fast paste-and-go input.

import { useCallback, useRef, useState } from "react";
import { BulkAddToast } from "./BulkAddToast";
import type { BulkAddLine, BulkAddResult } from "./bulkAddTypes";

type QuickOrderBarProps = {
  /** If a parent renders a Bulk-Grid toggle, pass a switch handler so the
   *  "Don't have a SKU list?" hint can flip the catalogue view. */
  onSwitchToGrid?: () => void;
};

/**
 * Parse the textarea into structured lines. Each non-empty trimmed line
 * splits on whitespace; we take the LAST token as qty (so "HX-FOO BAR 12"
 * still works), everything before as the SKU. Empty lines are dropped.
 * Lines with non-positive-integer qty are sent through with qty: 0 so the
 * server can mark them invalid (the server is the source of truth here).
 */
export function parseQuickOrderText(raw: string): BulkAddLine[] {
  const out: BulkAddLine[] = [];
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const parts = trimmed.split(/\s+/);
    if (parts.length < 2) {
      out.push({ sku: parts[0] ?? trimmed, qty: 0 });
      continue;
    }
    const qtyStr = parts[parts.length - 1]!;
    const sku = parts.slice(0, -1).join(" ").trim();
    const qty = Number(qtyStr);
    out.push({
      sku: sku || trimmed,
      qty: Number.isInteger(qty) && qty > 0 ? qty : 0
    });
  }
  return out;
}

export function QuickOrderBar({ onSwitchToGrid }: QuickOrderBarProps) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<BulkAddResult | null>(null);
  const [networkError, setNetworkError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const submit = useCallback(async () => {
    const lines = parseQuickOrderText(text);
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
      // On a fully clean submit (no errors anywhere), clear the textarea
      // so the buyer can paste the next batch.
      if (
        body.not_found.length === 0 &&
        body.invalid.length === 0 &&
        body.added.length > 0
      ) {
        setText("");
      }
    } catch (e) {
      setNetworkError((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  }, [text]);

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        void submit();
      }
    },
    [submit]
  );

  if (!open) {
    return (
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => {
            setOpen(true);
            // Defer focus to next tick so the textarea is mounted first.
            queueMicrotask(() => textareaRef.current?.focus());
          }}
          className="inline-flex h-9 items-center gap-2 rounded-full border border-brand-line bg-brand-surface px-4 text-xs font-semibold text-brand-text transition hover:border-brand-accent hover:text-brand-accent"
          aria-expanded={false}
          aria-controls="quick-order-panel"
        >
          <span aria-hidden className="text-brand-accent">+</span>
          Quick order
        </button>
        <span className="text-xs text-brand-muted">
          Paste a list of Refs and quantities
        </span>
      </div>
    );
  }

  const hasText = text.trim().length > 0;

  return (
    <section
      id="quick-order-panel"
      className="rounded-2xl border border-brand-line bg-brand-surface p-4"
      aria-label="Quick order paste"
    >
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-sm font-bold text-brand-text">Quick order</h2>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-xs text-brand-muted hover:text-brand-text"
        >
          Close
        </button>
      </div>

      <textarea
        ref={textareaRef}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={onKeyDown}
        spellCheck={false}
        autoCapitalize="off"
        autoCorrect="off"
        className="mt-3 h-32 w-full resize-y rounded-xl border border-brand-line bg-brand-bg p-3 font-mono text-xs leading-relaxed text-brand-text placeholder:text-brand-muted focus:border-brand-accent focus:outline-none"
        placeholder={"HX-PMB-001 12\nHX-CLW-22 24\nHX-PLS-08 6"}
        aria-label="Bulk Ref + quantity list"
      />

      <p className="mt-2 text-xs text-brand-muted">
        Paste one Ref per line, with quantity. Variants use Ref-with-suffix (e.g.{" "}
        <span className="font-mono text-brand-text">HX-SC-008-RED</span>).
        Press{" "}
        <kbd className="rounded border border-brand-line bg-brand-bg px-1 font-mono">
          Cmd/Ctrl + Enter
        </kbd>{" "}
        to submit.
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => void submit()}
          disabled={submitting || !hasText}
          className="inline-flex h-11 items-center justify-center rounded-full bg-brand-accent px-6 text-xs font-bold uppercase tracking-widest text-black transition disabled:opacity-40 hover:opacity-90"
        >
          {submitting ? "Adding…" : "Add to cart"}
        </button>
        {!hasText && onSwitchToGrid && (
          <button
            type="button"
            onClick={onSwitchToGrid}
            className="text-xs text-brand-accent underline-offset-2 hover:underline"
          >
            Don&rsquo;t have a SKU list? Switch to Bulk grid view
          </button>
        )}
      </div>

      {networkError && (
        <p
          role="alert"
          className="mt-3 rounded-xl border border-red-500/40 bg-red-500/10 p-2 text-xs text-red-300"
        >
          {networkError}
        </p>
      )}

      <BulkAddToast result={result} />
    </section>
  );
}
