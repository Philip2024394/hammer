import { FLAT_SHIPPING_REGIONS } from "@/lib/shipping";

export function DeliveryQuoteBanner() {
  return (
    <div className="rounded-xl border border-brand-accent/40 bg-brand-accent/5 p-4">
      <div className="text-xs uppercase tracking-widest text-brand-accent">Delivery</div>
      <p className="mt-2 text-sm font-semibold text-brand-text">
        Two-tier shipping — {FLAT_SHIPPING_REGIONS}.
      </p>
      <p className="mt-1 text-xs leading-relaxed text-brand-muted">
        <span className="font-semibold text-brand-text">£28 shipping under £50.</span>{" "}
        <span className="font-semibold text-brand-text">£20 flat</span> once you reach £50.
        Dispatched in{" "}
        <span className="font-semibold text-brand-text">4–5 working days</span>. Carrier-estimated
        air freight transit <span className="font-semibold text-brand-text">~5–7 days</span> to UK,
        USA, Australia. Sea freight (most countries) ~3–4 weeks and varies country to country.
        Other countries are confirmed on WhatsApp after checkout.
      </p>
    </div>
  );
}
