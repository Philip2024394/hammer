"use client";

// Final-step client: ship-to address, customer notes, submit button.
//
// Submit flow:
//   1. PATCH /api/trade/checkout-draft with ship_to_address + notes so a
//      mid-submit network blip doesn't lose the typing.
//   2. POST /api/trade/orders with the full payload. Server-side it reads
//      the cart in a single shot, snapshots prices, creates the order,
//      clears the cart, clears the draft, and returns an order_number.
//   3. router.push(`/trade/order/{order_number}`)
//
// We disable the submit button until ship-to is non-empty.

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

export function ReviewSubmit({
  defaultShipToAddress,
  defaultShipToCountry,
  defaultCustomerNotes
}: {
  defaultShipToAddress: string;
  defaultShipToCountry: string;
  defaultCustomerNotes: string;
}) {
  const router = useRouter();
  const [shipTo, setShipTo] = useState(defaultShipToAddress);
  const [shipToCountry, setShipToCountry] = useState(defaultShipToCountry);
  const [notes, setNotes] = useState(defaultCustomerNotes);
  const [submitting, startSubmit] = useTransition();
  const [err, setErr] = useState<string | null>(null);

  // Debounced background-save of in-flight edits so a reload doesn't lose
  // a half-typed address. We don't gate UI on this — just fire-and-forget.
  useEffect(() => {
    const timer = setTimeout(() => {
      void fetch("/api/trade/checkout-draft", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          ship_to_address: shipTo,
          ship_to_country: shipToCountry,
          customer_notes: notes
        })
      }).catch(() => {
        // Background save failure is silent — the final submit also writes.
      });
    }, 800);
    return () => clearTimeout(timer);
  }, [shipTo, shipToCountry, notes]);

  const canSubmit = useMemo(() => shipTo.trim().length > 0 && !submitting, [shipTo, submitting]);

  async function onSubmit() {
    if (!canSubmit) return;
    setErr(null);
    startSubmit(async () => {
      try {
        const res = await fetch("/api/trade/orders", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            ship_to_address: shipTo,
            ship_to_country: shipToCountry,
            customer_notes: notes
          })
        });
        const body = (await res.json().catch(() => ({}))) as {
          ok?: boolean;
          order_number?: string;
          error?: string;
        };
        if (!res.ok || !body.ok || !body.order_number) {
          setErr(body.error || "Could not submit order. Please try again.");
          return;
        }
        router.push(`/trade/order/${body.order_number}`);
      } catch (e: unknown) {
        setErr(e instanceof Error ? e.message : "Network error — please retry.");
      }
    });
  }

  return (
    <div className="rounded-2xl border border-brand-line bg-brand-surface p-5">
      <p className="text-xs font-semibold uppercase tracking-widest text-brand-accent">
        Ship-to & notes
      </p>

      <label className="mt-4 block">
        <span className="text-xs font-semibold text-brand-text">
          Ship-to address <span className="text-red-400">*</span>
        </span>
        <textarea
          value={shipTo}
          onChange={(e) => setShipTo(e.target.value)}
          rows={4}
          required
          placeholder="Company name&#10;Street&#10;City, postcode&#10;Country"
          className="mt-1.5 w-full rounded-lg border border-brand-line bg-brand-bg p-3 text-sm text-brand-text outline-none transition focus:border-brand-accent"
        />
      </label>

      <label className="mt-3 block">
        <span className="text-xs font-semibold text-brand-text">
          Ship-to country (ISO or name)
        </span>
        <input
          type="text"
          value={shipToCountry}
          onChange={(e) => setShipToCountry(e.target.value)}
          placeholder="e.g. GB, ID, MY"
          className="mt-1.5 h-11 w-full rounded-lg border border-brand-line bg-brand-bg px-3 text-sm text-brand-text outline-none transition focus:border-brand-accent"
        />
      </label>

      <label className="mt-3 block">
        <span className="text-xs font-semibold text-brand-text">Customer notes (optional)</span>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          placeholder="Anything we should know about delivery, dates, contacts, or packaging."
          className="mt-1.5 w-full rounded-lg border border-brand-line bg-brand-bg p-3 text-sm text-brand-text outline-none transition focus:border-brand-accent"
        />
      </label>

      {err && (
        <div
          role="alert"
          className="mt-4 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-xs text-red-300"
        >
          {err}
        </div>
      )}

      <button
        type="button"
        onClick={onSubmit}
        disabled={!canSubmit}
        className="mt-5 inline-flex h-12 w-full items-center justify-center rounded-full bg-brand-accent px-5 text-sm font-semibold uppercase tracking-widest text-black transition hover:opacity-90 disabled:opacity-40"
      >
        {submitting ? "Submitting…" : "Submit order for quote"}
      </button>

      <p className="mt-3 text-center text-[11px] text-brand-muted">
        Hammerex will email a freight-confirmed total within 24h.
      </p>
    </div>
  );
}
