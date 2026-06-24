"use client";

import { formatPriceForRegion } from "@/lib/fx";
import { useCountry } from "@/components/CountryProvider";
import type { HammerexPairWith } from "@/lib/supabase";

export function PairsWith({ pairs }: { pairs: HammerexPairWith[] }) {
  const country = useCountry();
  if (!pairs.length) return null;
  return (
    <section id="pairs-with" className="border-t border-brand-line py-10">
      <div className="mx-auto max-w-6xl px-4">
        <h2 className="mb-2 text-lg font-semibold text-brand-text">Pairs well with</h2>
        <p className="mb-6 text-xs text-brand-muted">Curated picks that make this tool better. Add one in a tap.</p>

        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {pairs.map((p) => (
            <li key={p.id} className="overflow-hidden rounded-2xl border border-brand-line bg-brand-surface">
              <a href={p.accessory.slug ? `/product/${p.accessory.slug}` : "#"} className="block h-40 w-full overflow-hidden bg-black">
                {p.accessory.image_url && (
                  <img src={p.accessory.image_url} alt={p.accessory.name} className="h-full w-full object-contain p-3 transition-transform hover:scale-105" />
                )}
              </a>
              <div className="flex flex-col gap-2 p-4">
                <a
                  href={p.accessory.slug ? `/product/${p.accessory.slug}` : "#"}
                  className="text-sm font-semibold text-brand-text hover:text-brand-accent"
                >
                  {p.accessory.name}
                </a>
                {p.reason && <p className="text-xs text-brand-muted">{p.reason}</p>}
                <div className="mt-1 flex items-center justify-between">
                  <span className="text-sm font-bold text-brand-text">{formatPriceForRegion(p.accessory.price_idr, "IDR", country)}</span>
                  <button
                    type="button"
                    className="h-10 rounded-full border border-brand-line bg-black px-4 text-xs font-semibold text-brand-text hover:border-brand-accent hover:text-brand-accent"
                  >
                    Add
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
