// Owner rule (2026-06-23): no £-pegged shipping tiers shown to customers.
// Delivery is always quoted by the Hammerex team after checkout for the
// whole order as a single package. The team replies within 24 hours.
export function DeliveryQuoteBanner() {
  return (
    <div className="rounded-xl border border-brand-accent/40 bg-brand-accent/5 p-4">
      <div className="text-xs uppercase tracking-widest text-brand-accent">Delivery</div>
      <p className="mt-2 text-sm font-semibold text-brand-text">
        Quoted by the Hammerex team within 24 hours.
      </p>
      <p className="mt-1 text-xs leading-relaxed text-brand-muted">
        After checkout we calculate the{" "}
        <span className="font-semibold text-brand-text">best combined rate</span> for
        your whole order as a single package — never per item — and reply by email or phone.
        You only pay once you have seen and accepted the delivery quote. Dispatched in{" "}
        <span className="font-semibold text-brand-text">4–5 working days</span> from payment,
        tracked end-to-end. Carrier-estimated air freight transit{" "}
        <span className="font-semibold text-brand-text">~5–7 days</span> to most countries;
        sea freight (most countries) ~3–4 weeks and varies country to country.
      </p>
    </div>
  );
}
