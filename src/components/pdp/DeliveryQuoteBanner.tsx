export function DeliveryQuoteBanner() {
  return (
    <div className="rounded-xl border border-brand-accent/40 bg-brand-accent/5 p-4">
      <div className="text-xs uppercase tracking-widest text-brand-accent">Delivery</div>
      <p className="mt-2 text-sm font-semibold text-brand-text">Quoted at checkout via WhatsApp.</p>
      <p className="mt-1 text-xs leading-relaxed text-brand-muted">
        Pick sea freight (4–6 weeks, most economical) or air freight (~6 working days, express). We confirm the delivery price with you before you pay.
      </p>
      <a
        href="/cart"
        className="mt-3 inline-flex h-10 items-center rounded-full bg-brand-accent px-4 text-xs font-semibold text-black hover:opacity-90"
      >Go to cart</a>
    </div>
  );
}
