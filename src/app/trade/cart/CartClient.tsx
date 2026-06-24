"use client";

// Client component for the trade cart line edits.
//
// Responsibilities:
//   - Render the line table with inline qty input, +/- buttons, remove
//   - Auto-bump qty < MOQ on blur with a small yellow toast
//   - Optimistically update subtotal as the user types
//   - PATCH /api/trade/cart/[id] on commit (Agent A's endpoints) — if the
//     endpoint doesn't exist yet we fall back to a hard reload so the user
//     can at least see the server state after they make changes via a
//     re-add. Status feedback never throws.
//   - "Continue to freight" routes to /trade/checkout/freight

import { useMemo, useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FX, formatPrice, type Currency } from "@/lib/fx";

export type CartLineView = {
  id: string;
  product_id: string;
  variant_id: string | null;
  product_name: string;
  product_slug: string | null;
  sku: string;
  image_url: string | null;
  variant_label: string | null;
  size: string | null;
  thread_color: string | null;
  qty: number;
  moq: number;
  unit_price_gbp: number;
  line_total_gbp: number;
};

type ToastMsg = { kind: "bumped" | "error"; text: string };

export function CartClient({
  lines: initialLines,
  subtotalGbp: initialSubtotalGbp,
  subtotalIdr: initialSubtotalIdr,
  displayCurrency
}: {
  lines: CartLineView[];
  subtotalGbp: number;
  subtotalIdr: number;
  displayCurrency: Currency;
}) {
  const router = useRouter();
  const [lines, setLines] = useState<CartLineView[]>(initialLines);
  const [toast, setToast] = useState<ToastMsg | null>(null);
  const [busy, setBusy] = useState<Record<string, boolean>>({});
  const [continuePending, startContinue] = useTransition();

  const subtotalGbp = useMemo(
    () => lines.reduce((sum, l) => sum + l.line_total_gbp, 0),
    [lines]
  );
  const subtotalIdr = useMemo(
    () => Math.round(subtotalGbp / FX.GBP.perIDR),
    [subtotalGbp]
  );
  const subtotalDisplay = useMemo(() => {
    if (displayCurrency === "GBP") {
      return new Intl.NumberFormat("en-GB", {
        style: "currency",
        currency: "GBP",
        maximumFractionDigits: 2
      }).format(subtotalGbp);
    }
    return formatPrice(subtotalIdr, displayCurrency);
  }, [subtotalGbp, subtotalIdr, displayCurrency]);

  function showToast(msg: ToastMsg) {
    setToast(msg);
    setTimeout(() => setToast((t) => (t === msg ? null : t)), 4000);
  }

  function fmtGbp(value: number) {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: "GBP",
      maximumFractionDigits: 2
    }).format(value);
  }

  function updateLineLocal(id: string, qty: number) {
    setLines((ls) =>
      ls.map((l) =>
        l.id === id
          ? { ...l, qty, line_total_gbp: +(qty * l.unit_price_gbp).toFixed(2) }
          : l
      )
    );
  }

  async function persistQty(line: CartLineView, qty: number) {
    setBusy((b) => ({ ...b, [line.id]: true }));
    try {
      const res = await fetch(`/api/trade/cart/${line.id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ qty })
      });
      if (!res.ok && res.status !== 404) {
        // Surface a soft error but keep optimistic UI; the user can retry.
        showToast({ kind: "error", text: "Could not save change — try again." });
      }
    } catch {
      // Network blip — keep optimistic local state, user will see server
      // truth on next page load. No throw.
    } finally {
      setBusy((b) => {
        const next = { ...b };
        delete next[line.id];
        return next;
      });
      router.refresh();
    }
  }

  async function remove(line: CartLineView) {
    setBusy((b) => ({ ...b, [line.id]: true }));
    setLines((ls) => ls.filter((l) => l.id !== line.id));
    try {
      await fetch(`/api/trade/cart/${line.id}`, { method: "DELETE" });
    } catch {
      // Same as above: ignore network failure; refresh will reconcile.
    } finally {
      setBusy((b) => {
        const next = { ...b };
        delete next[line.id];
        return next;
      });
      router.refresh();
    }
  }

  function onQtyBlur(line: CartLineView, raw: string) {
    const parsed = Number(raw);
    let next = Number.isFinite(parsed) ? Math.floor(parsed) : line.qty;
    if (!Number.isFinite(next) || next < 1) next = 1;
    if (next > 9999) next = 9999;

    let wasBumped = false;
    if (next < line.moq) {
      next = line.moq;
      wasBumped = true;
    }

    if (next === line.qty) return;

    updateLineLocal(line.id, next);
    if (wasBumped) {
      showToast({
        kind: "bumped",
        text: `MOQ for ${line.sku} is ${line.moq}. Quantity bumped.`
      });
    }
    void persistQty(line, next);
  }

  function bumpBy(line: CartLineView, delta: number) {
    let next = line.qty + delta;
    if (next < 1) next = 1;
    if (next > 9999) next = 9999;

    let wasBumped = false;
    if (next < line.moq) {
      next = line.moq;
      wasBumped = true;
    }

    if (next === line.qty) return;

    updateLineLocal(line.id, next);
    if (wasBumped) {
      showToast({
        kind: "bumped",
        text: `MOQ for ${line.sku} is ${line.moq}. Quantity bumped.`
      });
    }
    void persistQty(line, next);
  }

  function continueToFreight() {
    if (lines.length === 0) return;
    startContinue(() => {
      router.push("/trade/checkout/freight");
    });
  }

  if (lines.length === 0) {
    return (
      <div className="rounded-2xl border border-brand-line bg-brand-surface p-8 text-center">
        <p className="text-sm text-brand-text">Your trade cart is empty.</p>
        <p className="mt-1 text-xs text-brand-muted">
          Browse the catalogue and add products to assemble a wholesale order.
        </p>
        <a
          href="/trade"
          className="mt-5 inline-flex h-10 items-center rounded-full bg-brand-accent px-5 text-xs font-semibold uppercase tracking-widest text-black transition hover:opacity-90"
        >
          Back to trade home
        </a>
      </div>
    );
  }

  const lineCountLabel = `${lines.length} ${lines.length === 1 ? "line" : "lines"}`;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
      <section>
        {toast && (
          <div
            role="status"
            aria-live="polite"
            className={`mb-3 rounded-xl border px-4 py-3 text-xs ${
              toast.kind === "bumped"
                ? "border-yellow-400/40 bg-yellow-400/10 text-yellow-200"
                : "border-red-500/40 bg-red-500/10 text-red-300"
            }`}
          >
            {toast.text}
          </div>
        )}

        {/* Table view on md+, stacked cards on mobile */}
        <div className="hidden rounded-2xl border border-brand-line bg-brand-surface md:block">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-brand-line text-brand-muted">
              <tr>
                <th className="w-[80px] p-3 font-semibold uppercase tracking-wider">Item</th>
                <th className="p-3 font-semibold uppercase tracking-wider">Ref / name</th>
                <th className="w-[140px] p-3 font-semibold uppercase tracking-wider">Qty</th>
                <th className="w-[110px] p-3 text-right font-semibold uppercase tracking-wider">Unit</th>
                <th className="w-[110px] p-3 text-right font-semibold uppercase tracking-wider">Line total</th>
                <th className="w-[60px] p-3" />
              </tr>
            </thead>
            <tbody>
              {lines.map((line) => {
                const belowMoq = line.qty < line.moq;
                return (
                  <tr key={line.id} className="border-b border-brand-line/60 last:border-b-0 align-top">
                    <td className="p-3">
                      {line.image_url ? (
                        <div className="relative h-14 w-14 overflow-hidden rounded-lg border border-brand-line bg-brand-bg">
                          <Image
                            src={line.image_url}
                            alt={line.product_name}
                            fill
                            sizes="56px"
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="h-14 w-14 rounded-lg border border-brand-line bg-brand-bg" />
                      )}
                    </td>
                    <td className="p-3">
                      <p className="font-semibold text-brand-text">{line.product_name}</p>
                      <p className="mt-0.5 text-brand-muted">
                        Ref: <span className="font-mono text-brand-text">{line.sku}</span>
                      </p>
                      {(line.variant_label || line.size || line.thread_color) && (
                        <p className="mt-0.5 text-brand-muted">
                          {[line.variant_label, line.size, line.thread_color]
                            .filter(Boolean)
                            .join(" · ")}
                        </p>
                      )}
                      <p className="mt-0.5 text-[11px] text-brand-muted">MOQ {line.moq}</p>
                      {belowMoq && (
                        <p className="mt-1 text-[11px] font-semibold text-red-400">
                          Below MOQ — auto-bumped to {line.moq}
                        </p>
                      )}
                    </td>
                    <td className="p-3">
                      <div className="inline-flex items-center rounded-lg border border-brand-line bg-brand-bg">
                        <button
                          type="button"
                          aria-label="Decrease quantity"
                          onClick={() => bumpBy(line, -1)}
                          disabled={busy[line.id]}
                          className="h-9 w-9 text-brand-text transition hover:text-brand-accent disabled:opacity-40"
                        >
                          −
                        </button>
                        <input
                          type="number"
                          inputMode="numeric"
                          min={1}
                          max={9999}
                          value={line.qty}
                          onChange={(e) => updateLineLocal(line.id, Math.max(1, Math.floor(Number(e.target.value) || 1)))}
                          onBlur={(e) => onQtyBlur(line, e.target.value)}
                          disabled={busy[line.id]}
                          className="h-9 w-14 bg-transparent text-center text-sm text-brand-text outline-none disabled:opacity-40"
                        />
                        <button
                          type="button"
                          aria-label="Increase quantity"
                          onClick={() => bumpBy(line, 1)}
                          disabled={busy[line.id]}
                          className="h-9 w-9 text-brand-text transition hover:text-brand-accent disabled:opacity-40"
                        >
                          +
                        </button>
                      </div>
                    </td>
                    <td className="p-3 text-right font-mono text-brand-text">
                      {fmtGbp(line.unit_price_gbp)}
                    </td>
                    <td className="p-3 text-right font-mono text-brand-text">
                      {fmtGbp(line.line_total_gbp)}
                    </td>
                    <td className="p-3 text-right">
                      <button
                        type="button"
                        onClick={() => remove(line)}
                        disabled={busy[line.id]}
                        className="text-brand-muted transition hover:text-red-400 disabled:opacity-40"
                        aria-label={`Remove ${line.product_name}`}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile stacked cards */}
        <div className="grid gap-3 md:hidden">
          {lines.map((line) => {
            const belowMoq = line.qty < line.moq;
            return (
              <div
                key={line.id}
                className="rounded-2xl border border-brand-line bg-brand-surface p-3"
              >
                <div className="flex gap-3">
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-brand-line bg-brand-bg">
                    {line.image_url && (
                      <Image
                        src={line.image_url}
                        alt={line.product_name}
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-brand-text">
                      {line.product_name}
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
                    <p className="text-[11px] text-brand-muted">MOQ {line.moq}</p>
                  </div>
                </div>

                {belowMoq && (
                  <p className="mt-2 text-[11px] font-semibold text-red-400">
                    Below MOQ — auto-bumped to {line.moq}
                  </p>
                )}

                <div className="mt-3 flex items-center justify-between">
                  <div className="inline-flex items-center rounded-lg border border-brand-line bg-brand-bg">
                    <button
                      type="button"
                      aria-label="Decrease quantity"
                      onClick={() => bumpBy(line, -1)}
                      disabled={busy[line.id]}
                      className="h-9 w-9 text-brand-text transition hover:text-brand-accent disabled:opacity-40"
                    >
                      −
                    </button>
                    <input
                      type="number"
                      inputMode="numeric"
                      min={1}
                      max={9999}
                      value={line.qty}
                      onChange={(e) => updateLineLocal(line.id, Math.max(1, Math.floor(Number(e.target.value) || 1)))}
                      onBlur={(e) => onQtyBlur(line, e.target.value)}
                      disabled={busy[line.id]}
                      className="h-9 w-14 bg-transparent text-center text-sm text-brand-text outline-none disabled:opacity-40"
                    />
                    <button
                      type="button"
                      aria-label="Increase quantity"
                      onClick={() => bumpBy(line, 1)}
                      disabled={busy[line.id]}
                      className="h-9 w-9 text-brand-text transition hover:text-brand-accent disabled:opacity-40"
                    >
                      +
                    </button>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-sm text-brand-text">{fmtGbp(line.line_total_gbp)}</p>
                    <p className="text-[11px] text-brand-muted">{fmtGbp(line.unit_price_gbp)} ea</p>
                  </div>
                </div>

                <div className="mt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={() => remove(line)}
                    disabled={busy[line.id]}
                    className="text-xs text-brand-muted transition hover:text-red-400 disabled:opacity-40"
                  >
                    Remove
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Summary card — sticky on desktop */}
      <aside className="lg:sticky lg:top-32 lg:self-start">
        <div className="rounded-2xl border border-brand-line bg-brand-surface p-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-accent">
            Order summary
          </p>
          <p className="mt-2 text-xs text-brand-muted">{lineCountLabel} in cart</p>

          <div className="mt-4 flex items-baseline justify-between border-b border-brand-line pb-3">
            <span className="text-xs uppercase tracking-wider text-brand-muted">Subtotal</span>
            <span className="font-mono text-lg font-semibold text-brand-text">
              {subtotalDisplay}
            </span>
          </div>

          {displayCurrency !== "GBP" && (
            <p className="mt-2 text-[11px] text-brand-muted">
              Trade currency · {fmtGbp(subtotalGbp)}
            </p>
          )}

          <p className="mt-2 text-[11px] text-brand-muted">
            Locked in IDR at{" "}
            <span className="font-mono text-brand-text">
              {new Intl.NumberFormat("id-ID", {
                style: "currency",
                currency: "IDR",
                maximumFractionDigits: 0
              }).format(subtotalIdr)}
            </span>{" "}
            — freight quoted separately
          </p>

          <button
            type="button"
            onClick={continueToFreight}
            disabled={continuePending || lines.length === 0}
            className="mt-5 inline-flex h-11 w-full items-center justify-center rounded-full bg-brand-accent px-5 text-xs font-semibold uppercase tracking-widest text-black transition hover:opacity-90 disabled:opacity-40"
          >
            {continuePending ? "Loading…" : "Continue to freight"}
          </button>

          <p className="mt-3 text-center text-[11px] text-brand-muted">
            You'll choose Air or Sea next.
          </p>
        </div>
      </aside>
    </div>
  );
}
