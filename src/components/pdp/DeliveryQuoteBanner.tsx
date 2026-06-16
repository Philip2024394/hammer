import { FLAT_SHIPPING_REGIONS } from "@/lib/shipping";

export function DeliveryQuoteBanner() {
  return (
    <div className="rounded-xl border border-brand-accent/40 bg-brand-accent/5 p-4">
      <div className="text-xs uppercase tracking-widest text-brand-accent">Delivery</div>
      <p className="mt-2 text-sm font-semibold text-brand-text">
        Two-tier shipping — {FLAT_SHIPPING_REGIONS}.
      </p>
      <p className="mt-1 text-xs leading-relaxed text-brand-muted">
        <span className="font-semibold text-brand-text">£30 minimum order.</span> £28 shipping
        on £30–£49 orders. <span className="font-semibold text-brand-text">£20 flat</span> once
        you reach £50. Dispatched within{" "}
        <span className="font-semibold text-brand-text">3 working days</span> via EMS Air
        Mail · <span className="font-semibold text-brand-text">5–6 days transit</span> to UK,
        USA, Australia. Other countries are confirmed on WhatsApp after checkout.
      </p>
    </div>
  );
}
