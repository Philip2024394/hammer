"use client";

import type { FreightChoice } from "@/lib/whatsapp";
import { HeaderIcon, Truck } from "./Icons";

const OPTIONS: { value: FreightChoice; title: string; tag: string; body: string }[] = [
  {
    value: "sea",
    title: "Sea freight",
    tag: "Most economical",
    body: "4–6 weeks transit after dispatch. The right call for non-urgent orders — significantly cheaper than air. Dispatch ~3 working days, confirmed on WhatsApp quote."
  },
  {
    value: "air",
    title: "Air freight",
    tag: "Worldwide",
    body: "5–6 days transit after dispatch, worldwide (UK, USA, Australia, EU). Dispatch ~3 working days, confirmed on WhatsApp quote based on production readiness."
  }
];

export function FreightSelector({ value, onChange }: { value: FreightChoice; onChange: (v: FreightChoice) => void }) {
  return (
    <fieldset>
      <legend className="mb-3 flex items-center gap-2 text-sm font-semibold text-brand-text">
        <HeaderIcon icon={<Truck size={16} />} />
        Freight method
      </legend>
      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {OPTIONS.map((o) => (
          <li key={o.value}>
            <label className={`flex h-full cursor-pointer flex-col gap-2 rounded-2xl border p-5 ${
              value === o.value ? "border-brand-accent bg-brand-accent/10" : "border-brand-line bg-brand-surface"
            }`}>
              <div className="flex items-center justify-between">
                <input
                  type="radio"
                  name="freight"
                  value={o.value}
                  checked={value === o.value}
                  onChange={() => onChange(o.value)}
                  className="h-4 w-4 accent-brand-accent"
                />
                <span className="rounded-full bg-brand-accent/15 px-2 py-0.5 text-xs font-bold uppercase tracking-wider text-brand-accent">{o.tag}</span>
              </div>
              <h3 className="text-sm font-semibold text-brand-text">{o.title}</h3>
              <p className="text-xs leading-relaxed text-brand-muted">{o.body}</p>
            </label>
          </li>
        ))}
      </ul>
    </fieldset>
  );
}
