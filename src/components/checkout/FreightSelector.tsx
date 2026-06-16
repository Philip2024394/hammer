"use client";

import { HeaderIcon, Truck } from "./Icons";
import { FLAT_SHIPPING_REGIONS } from "@/lib/shipping";

export function FreightSelector() {
  return (
    <fieldset>
      <legend className="mb-3 flex items-center gap-2 text-sm font-semibold text-brand-text">
        <HeaderIcon icon={<Truck size={16} />} />
        Shipping method
      </legend>
      <div className="rounded-2xl border border-brand-accent bg-brand-accent/10 p-5">
        <div className="flex items-center justify-between">
          <span className="rounded-full bg-brand-accent/20 px-2 py-0.5 text-xs font-bold uppercase tracking-wider text-brand-accent">
            {FLAT_SHIPPING_REGIONS}
          </span>
          <span className="text-sm font-bold text-brand-accent">EMS Air Mail</span>
        </div>
        <h3 className="mt-2 text-sm font-semibold text-brand-text">Two-tier shipping</h3>
        <ul className="mt-2 flex flex-col gap-1 text-xs text-brand-muted">
          <li>· £30 minimum order</li>
          <li>· £28 shipping on £30–£49 carts</li>
          <li>· £20 flat shipping once you reach £50</li>
          <li>· Dispatch in 3 working days, 5–6 days transit</li>
          <li>· Tracked end-to-end · other countries quoted on WhatsApp</li>
        </ul>
      </div>
    </fieldset>
  );
}
