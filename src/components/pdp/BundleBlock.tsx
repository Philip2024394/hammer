"use client";

import { useMemo, useState } from "react";
import { formatPrice } from "@/lib/fx";
import { bundlePricing } from "@/lib/pricing";
import type { HammerexBundle } from "@/lib/supabase";

export function BundleBlock({ bundle }: { bundle: HammerexBundle | null }) {
  if (!bundle?.items.length) return null;

  const [picked, setPicked] = useState<Record<string, boolean>>(
    Object.fromEntries(bundle.items.map((i) => [i.id, true]))
  );

  const selected = bundle.items.filter((i) => picked[i.id]);
  const { original, final, savings } = useMemo(
    () => bundlePricing(selected.map((i) => i.product.price_idr * i.qty), bundle.discount_pct),
    [selected, bundle.discount_pct]
  );

  return (
    <section id="bundle" className="border-t border-brand-line py-10">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-2 flex items-center gap-2">
          <span className="rounded-full bg-brand-accent px-2 py-0.5 text-xs font-bold uppercase tracking-wider text-black">
            Save {bundle.discount_pct}%
          </span>
          <h2 className="text-lg font-semibold text-brand-text">{bundle.title}</h2>
        </div>
        <p className="mb-6 text-xs text-brand-muted">Tick items to recalculate. Bundle discount applies automatically.</p>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_320px]">
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {bundle.items.map((item, idx) => (
              <li key={item.id} className="relative">
                <label className="flex h-full cursor-pointer flex-col gap-3 rounded-2xl border border-brand-line bg-brand-surface p-3 has-[:checked]:border-brand-accent">
                  <div className="flex items-center justify-between">
                    <input
                      type="checkbox"
                      checked={!!picked[item.id]}
                      onChange={(e) => setPicked((p) => ({ ...p, [item.id]: e.target.checked }))}
                      className="h-4 w-4 accent-brand-accent"
                      aria-label={`Include ${item.product.name}`}
                    />
                    {idx < bundle.items.length - 1 && (
                      <span className="hidden text-brand-muted sm:inline">+</span>
                    )}
                  </div>
                  <div className="aspect-square overflow-hidden rounded-lg border border-brand-line bg-black">
                    {item.product.image_url && (
                      <img src={item.product.image_url} alt={item.product.name} className="h-full w-full object-contain p-2" />
                    )}
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-brand-text">{item.product.name}</div>
                    <div className="text-xs text-brand-muted">{formatPrice(item.product.price_idr, "IDR")}</div>
                  </div>
                </label>
              </li>
            ))}
          </ul>

          <aside className="rounded-2xl border border-brand-line bg-brand-surface p-5">
            <div className="text-xs text-brand-muted">Original</div>
            <div className="text-sm text-brand-muted line-through">{formatPrice(original, "IDR")}</div>
            <div className="mt-2 text-xs text-brand-muted">Bundle price</div>
            <div className="text-2xl font-bold text-brand-text">{formatPrice(final, "IDR")}</div>
            <div className="mt-1 inline-block rounded-full bg-brand-accent/15 px-2 py-0.5 text-xs font-semibold text-brand-accent">
              You save {formatPrice(savings, "IDR")}
            </div>
            <button
              type="button"
              disabled={selected.length === 0}
              className="mt-4 h-12 w-full rounded-full bg-brand-accent text-sm font-semibold text-black hover:opacity-90 disabled:opacity-40"
            >
              Add bundle to cart
            </button>
          </aside>
        </div>
      </div>
    </section>
  );
}
