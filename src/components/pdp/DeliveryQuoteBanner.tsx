export function DeliveryQuoteBanner() {
  return (
    <div className="rounded-xl border border-brand-accent/40 bg-brand-accent/5 p-4">
      <div className="text-xs uppercase tracking-widest text-brand-accent">Delivery</div>
      <p className="mt-2 text-sm font-semibold text-brand-text">Quoted at checkout — today's rates.</p>
      <p className="mt-1 text-xs leading-relaxed text-brand-muted">
        Delivery cost depends on your country and the items in your cart. Pick sea freight (4–6 weeks, most economical) or air freight (~6 working days, express) at checkout and we confirm the price direct on WhatsApp before you pay.
      </p>
    </div>
  );
}
