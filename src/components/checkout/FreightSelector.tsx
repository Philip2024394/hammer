"use client";

import { HeaderIcon, Truck } from "./Icons";

// Owner rule (2026-06-23): no £-pegged shipping tiers shown to customers
// — delivery is always quoted by the team after checkout for the whole
// order as a single package. Stripe / upfront freight rules removed with
// the same change.
export function FreightSelector() {
  return (
    <fieldset>
      <legend className="mb-3 flex items-center gap-2 text-sm font-semibold text-brand-text">
        <HeaderIcon icon={<Truck size={16} />} />
        Shipping method
      </legend>
      <div className="rounded-2xl border border-brand-accent bg-brand-accent/10 p-5">
        <h3 className="text-sm font-semibold text-brand-text">Delivery quoted within 24 hours</h3>
        <ul className="mt-2 flex flex-col gap-1 text-xs text-brand-muted">
          <li>· The Hammerex team calculates the best combined rate for your whole order as a single package — never per item.</li>
          <li>· We reply by email or phone, usually within 24 hours.</li>
          <li>· You only pay once you have seen and accepted the delivery quote.</li>
          <li>· Dispatch in 4–5 working days from payment · tracked end-to-end.</li>
        </ul>
      </div>
    </fieldset>
  );
}
