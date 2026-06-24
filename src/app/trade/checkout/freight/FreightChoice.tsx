"use client";

// Client component: Air vs Sea card picker + Incoterm dropdown.
//
// Estimate bands (midpoints, labelled indicative):
//   - Air: 32% of goods value
//   - Sea: 8%  of goods value
// These are illustrative only — Hammerex confirms the actual quote within
// 24h. We surface them to give the buyer ballpark so the freight choice
// isn't blind.
//
// State flow:
//   1. Pick Air or Sea — persisted immediately via PATCH /api/trade/checkout-draft
//   2. Incoterm dropdown reveals; defaults to FOB. Change persists too.
//   3. "Continue to review" routes to /trade/checkout/review. We refuse to
//      advance until BOTH freight_mode and incoterm are set.

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { FX, formatPrice, type Currency } from "@/lib/fx";

type FreightMode = "air" | "sea";
type Incoterm = "FOB" | "CIF" | "EXW" | "DAP" | "DDP";

const INCOTERM_OPTIONS: { value: Incoterm; label: string; blurb: string }[] = [
  {
    value: "FOB",
    label: "FOB — Free On Board",
    blurb: "We deliver goods to the named port; buyer takes title at port-of-loading."
  },
  {
    value: "CIF",
    label: "CIF — Cost, Insurance & Freight",
    blurb: "We pay freight + marine insurance to the destination port; buyer clears import."
  },
  {
    value: "EXW",
    label: "EXW — Ex Works",
    blurb: "Buyer collects from our Yogyakarta workshop and arranges all transport."
  },
  {
    value: "DAP",
    label: "DAP — Delivered At Place",
    blurb: "We deliver to the named destination; buyer pays import duties + taxes."
  },
  {
    value: "DDP",
    label: "DDP — Delivered Duty Paid",
    blurb: "We deliver to the named destination, all duties + taxes prepaid."
  }
];

const AIR_PCT = 0.32;
const SEA_PCT = 0.08;

function fmtGbp(value: number) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: 2
  }).format(value);
}

export function FreightChoice({
  goodsGbp,
  displayCurrency,
  initialFreightMode,
  initialIncoterm
}: {
  goodsGbp: number;
  displayCurrency: Currency;
  initialFreightMode: FreightMode | null;
  initialIncoterm: string | null;
}) {
  const router = useRouter();
  const [freightMode, setFreightMode] = useState<FreightMode | null>(initialFreightMode);
  const [incoterm, setIncoterm] = useState<Incoterm>(
    (initialIncoterm as Incoterm) || "FOB"
  );
  const [savingMode, setSavingMode] = useState<FreightMode | null>(null);
  const [savingIncoterm, setSavingIncoterm] = useState(false);
  const [continuePending, startContinue] = useTransition();
  const [err, setErr] = useState<string | null>(null);

  const airFreight = +(goodsGbp * AIR_PCT).toFixed(2);
  const seaFreight = +(goodsGbp * SEA_PCT).toFixed(2);
  const airTotal = +(goodsGbp + airFreight).toFixed(2);
  const seaTotal = +(goodsGbp + seaFreight).toFixed(2);

  function localDisplay(gbp: number) {
    if (displayCurrency === "GBP") return fmtGbp(gbp);
    const idr = Math.round(gbp / FX.GBP.perIDR);
    return formatPrice(idr, displayCurrency);
  }

  async function persistDraft(patch: Record<string, unknown>) {
    setErr(null);
    const res = await fetch("/api/trade/checkout-draft", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(patch)
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error((body as { error?: string }).error || "Could not save");
    }
  }

  async function chooseFreight(mode: FreightMode) {
    setSavingMode(mode);
    try {
      // Persist freight_mode AND ensure incoterm has a default value saved
      // — otherwise a buyer who never opens the dropdown still has FOB
      // stored, matching what's displayed.
      await persistDraft({ freight_mode: mode, incoterm });
      setFreightMode(mode);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Could not save freight choice");
    } finally {
      setSavingMode(null);
    }
  }

  async function changeIncoterm(value: Incoterm) {
    setIncoterm(value); // Optimistic
    setSavingIncoterm(true);
    try {
      await persistDraft({ incoterm: value });
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Could not save incoterm");
    } finally {
      setSavingIncoterm(false);
    }
  }

  function continueToReview() {
    if (!freightMode || !incoterm) {
      setErr("Choose a freight mode and incoterm first.");
      return;
    }
    startContinue(() => {
      router.push("/trade/checkout/review");
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
      <section className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          {/* AIR CARD */}
          <button
            type="button"
            onClick={() => chooseFreight("air")}
            disabled={savingMode !== null}
            className={`group rounded-2xl border bg-brand-surface p-5 text-left transition disabled:opacity-60 ${
              freightMode === "air"
                ? "border-brand-accent ring-2 ring-brand-accent/30"
                : "border-brand-line hover:border-brand-accent/70"
            }`}
          >
            <p className="text-xs font-semibold uppercase tracking-widest text-brand-accent">
              Air freight
            </p>
            <p className="mt-1 text-base font-bold text-brand-text">5 – 7 business days</p>
            <div className="mt-4 space-y-1 text-xs">
              <div className="flex justify-between text-brand-muted">
                <span>Goods</span>
                <span className="font-mono text-brand-text">{localDisplay(goodsGbp)}</span>
              </div>
              <div className="flex justify-between text-brand-muted">
                <span>Freight (~32%)</span>
                <span className="font-mono text-brand-text">~{localDisplay(airFreight)}</span>
              </div>
              <div className="my-2 border-t border-brand-line" />
              <div className="flex justify-between text-sm">
                <span className="text-brand-text">Total (est.)</span>
                <span className="font-mono font-semibold text-brand-text">
                  ~{localDisplay(airTotal)}
                </span>
              </div>
            </div>
            <p className="mt-4 text-xs text-brand-muted">
              Best for urgent jobs, samples, small parcels.
            </p>
            <p className="mt-3 text-[11px] uppercase tracking-wider text-brand-muted">
              Indicative — final quote within 24h
            </p>
            <div className="mt-4">
              <span
                className={`inline-flex h-9 items-center rounded-full px-4 text-xs font-semibold uppercase tracking-widest transition ${
                  freightMode === "air"
                    ? "bg-brand-accent text-black"
                    : "border border-brand-line text-brand-text group-hover:border-brand-accent group-hover:text-brand-accent"
                }`}
              >
                {savingMode === "air"
                  ? "Saving…"
                  : freightMode === "air"
                    ? "Air selected"
                    : "Choose Air"}
              </span>
            </div>
          </button>

          {/* SEA CARD */}
          <button
            type="button"
            onClick={() => chooseFreight("sea")}
            disabled={savingMode !== null}
            className={`group rounded-2xl border bg-brand-surface p-5 text-left transition disabled:opacity-60 ${
              freightMode === "sea"
                ? "border-brand-accent ring-2 ring-brand-accent/30"
                : "border-brand-line hover:border-brand-accent/70"
            }`}
          >
            <p className="text-xs font-semibold uppercase tracking-widest text-brand-accent">
              Sea freight
            </p>
            <p className="mt-1 text-base font-bold text-brand-text">3 – 4 weeks</p>
            <div className="mt-4 space-y-1 text-xs">
              <div className="flex justify-between text-brand-muted">
                <span>Goods</span>
                <span className="font-mono text-brand-text">{localDisplay(goodsGbp)}</span>
              </div>
              <div className="flex justify-between text-brand-muted">
                <span>Freight (~8%)</span>
                <span className="font-mono text-brand-text">~{localDisplay(seaFreight)}</span>
              </div>
              <div className="my-2 border-t border-brand-line" />
              <div className="flex justify-between text-sm">
                <span className="text-brand-text">Total (est.)</span>
                <span className="font-mono font-semibold text-brand-text">
                  ~{localDisplay(seaTotal)}
                </span>
              </div>
            </div>
            <p className="mt-4 text-xs text-brand-muted">
              Best for planned restock, pallets, container loads.
            </p>
            <p className="mt-3 text-[11px] uppercase tracking-wider text-brand-muted">
              Indicative — final quote within 24h
            </p>
            <div className="mt-4">
              <span
                className={`inline-flex h-9 items-center rounded-full px-4 text-xs font-semibold uppercase tracking-widest transition ${
                  freightMode === "sea"
                    ? "bg-brand-accent text-black"
                    : "border border-brand-line text-brand-text group-hover:border-brand-accent group-hover:text-brand-accent"
                }`}
              >
                {savingMode === "sea"
                  ? "Saving…"
                  : freightMode === "sea"
                    ? "Sea selected"
                    : "Choose Sea"}
              </span>
            </div>
          </button>
        </div>

        {/* Incoterm reveal — shows once a freight mode is picked */}
        {freightMode && (
          <div className="rounded-2xl border border-brand-line bg-brand-surface p-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-brand-accent">
              Incoterm
            </p>
            <p className="mt-1 text-xs text-brand-muted">
              How responsibility transfers between Hammerex and your business.
            </p>
            <label className="mt-4 block">
              <span className="sr-only">Choose an incoterm</span>
              <select
                value={incoterm}
                onChange={(e) => changeIncoterm(e.target.value as Incoterm)}
                disabled={savingIncoterm}
                className="h-11 w-full rounded-lg border border-brand-line bg-brand-bg px-3 text-sm text-brand-text outline-none transition focus:border-brand-accent disabled:opacity-60"
              >
                {INCOTERM_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>
            <p className="mt-3 text-xs text-brand-muted">
              {INCOTERM_OPTIONS.find((o) => o.value === incoterm)?.blurb}
            </p>
          </div>
        )}

        {err && (
          <div
            role="alert"
            className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-xs text-red-300"
          >
            {err}
          </div>
        )}
      </section>

      <aside className="lg:sticky lg:top-32 lg:self-start">
        <div className="rounded-2xl border border-brand-line bg-brand-surface p-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-accent">
            Selected
          </p>
          <div className="mt-3 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-brand-muted">Freight</span>
              <span className="text-brand-text">
                {freightMode ? (freightMode === "air" ? "Air" : "Sea") : "—"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-brand-muted">Incoterm</span>
              <span className="text-brand-text">{freightMode ? incoterm : "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-brand-muted">Goods</span>
              <span className="font-mono text-brand-text">{localDisplay(goodsGbp)}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={continueToReview}
            disabled={!freightMode || continuePending}
            className="mt-5 inline-flex h-11 w-full items-center justify-center rounded-full bg-brand-accent px-5 text-xs font-semibold uppercase tracking-widest text-black transition hover:opacity-90 disabled:opacity-40"
          >
            {continuePending ? "Loading…" : "Continue to review"}
          </button>

          <a
            href="/trade/cart"
            className="mt-3 inline-flex h-9 w-full items-center justify-center rounded-full border border-brand-line px-5 text-[11px] font-semibold uppercase tracking-widest text-brand-muted transition hover:border-brand-line hover:text-brand-text"
          >
            Back to cart
          </a>
        </div>
      </aside>
    </div>
  );
}
