"use client";

import { useEffect, useMemo, useState } from "react";
import type { HammerexShippingZone } from "@/lib/supabase";
import { deliveryWindow, formatCountdown, formatRange, nextDispatch, shippingFeeIdr } from "@/lib/dispatch";
import { formatPrice, type Currency } from "@/lib/fx";

export function LiveETA({
  zones,
  cutoffLocal,
  weightKg,
  currency,
  lineTotalIdr
}: {
  zones: HammerexShippingZone[];
  cutoffLocal: string;
  weightKg: number;
  currency: Currency;
  lineTotalIdr: number;
}) {
  const defaultZone = zones.find((z) => z.is_default) ?? zones[0];
  const [code, setCode] = useState(defaultZone?.country_code ?? "ID");
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 60_000);
    return () => clearInterval(id);
  }, []);

  const zone = zones.find((z) => z.country_code === code) ?? defaultZone;

  const view = useMemo(() => {
    if (!zone) return null;
    const dispatch = nextDispatch(cutoffLocal);
    const win = deliveryWindow(dispatch.date, zone);
    const baseFee = shippingFeeIdr(zone, weightKg);
    const free = zone.free_shipping_threshold_idr > 0 && lineTotalIdr >= zone.free_shipping_threshold_idr;
    const remaining = zone.free_shipping_threshold_idr > 0 ? Math.max(0, zone.free_shipping_threshold_idr - lineTotalIdr) : 0;
    const pct = zone.free_shipping_threshold_idr > 0
      ? Math.min(100, (lineTotalIdr / zone.free_shipping_threshold_idr) * 100)
      : 0;
    return { dispatch, win, baseFee, free, remaining, pct };
  }, [zone, cutoffLocal, weightKg, lineTotalIdr, tick]);

  if (!zone || !view) return null;

  return (
    <div className="rounded-xl border border-brand-line bg-black/40 p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="text-xs uppercase tracking-widest text-brand-muted">Delivery</div>
        <select
          value={code}
          onChange={(e) => setCode(e.target.value)}
          aria-label="Destination country"
          className="h-9 rounded-md border border-brand-line bg-brand-surface px-2 text-xs text-brand-text focus:border-brand-accent focus:outline-none"
        >
          {zones.map((z) => (
            <option key={z.country_code} value={z.country_code}>{z.country_name}</option>
          ))}
        </select>
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        {view.dispatch.sameDay ? (
          <>
            <span className="inline-flex h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
            <p className="text-sm text-brand-text">
              Order in <span className="font-semibold text-emerald-400">{formatCountdown(view.dispatch.msUntilCutoff)}</span> for dispatch today
            </p>
          </>
        ) : (
          <p className="text-sm text-brand-text">Dispatching tomorrow from Jakarta</p>
        )}
      </div>

      <p className="mt-1 text-sm text-brand-text">
        Arrives <span className="font-semibold">{formatRange(view.win.from, view.win.to)}</span> via {zone.carrier}
      </p>

      {zone.free_shipping_threshold_idr > 0 && (
        <div className="mt-3 rounded-lg border border-brand-line bg-brand-surface p-3">
          {view.free ? (
            <p className="text-xs font-semibold text-brand-accent">Free shipping included!</p>
          ) : (
            <>
              <p className="text-xs text-brand-text">
                Add <span className="font-semibold text-brand-accent">{formatPrice(view.remaining, currency)}</span> for free shipping
              </p>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-black">
                <div className="h-full bg-brand-accent transition-all" style={{ width: `${view.pct}%` }} />
              </div>
            </>
          )}
        </div>
      )}

      <div className="mt-3 flex items-center justify-between border-t border-brand-line pt-3 text-xs text-brand-muted">
        <span>Shipping to {zone.country_name}</span>
        <span className={`font-semibold ${view.free ? "text-brand-muted line-through" : "text-brand-text"}`}>
          {formatPrice(view.baseFee, currency)}
        </span>
      </div>
    </div>
  );
}
