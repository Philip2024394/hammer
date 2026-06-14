export function DeliveryQuoteBanner() {
  return (
    <div className="rounded-xl border border-brand-accent/40 bg-brand-accent/5 p-4">
      <div className="text-xs uppercase tracking-widest text-brand-accent">Delivery</div>
      <p className="mt-2 text-sm font-semibold text-brand-text">Quoted at checkout — today's rates.</p>
      <p className="mt-1 text-xs leading-relaxed text-brand-muted">
        Dispatch is estimated at <span className="font-semibold text-brand-text">3 working days</span> and confirmed on the WhatsApp quote based on production readiness at the moment of order. After dispatch: pick sea freight (4–6 weeks transit) or air freight (<span className="font-semibold text-brand-text">5–6 days transit worldwide</span> — UK, USA, Australia, EU). Delivery cost depends on your country.
      </p>
    </div>
  );
}
