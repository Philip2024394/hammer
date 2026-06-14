export function ShippingReturns({ warrantyYears, dispatchLeadDays }: {
  warrantyYears: number;
  dispatchLeadDays: number;
}) {
  const dispatchText = dispatchLeadDays > 0
    ? `Orders dispatch within ${dispatchLeadDays} working day${dispatchLeadDays === 1 ? "" : "s"} of confirmation. Tracking link on dispatch.`
    : `Orders placed before 2:00 PM Jakarta time (WIB) ship the same day. Later orders dispatch the next business day. Tracking link on dispatch.`;

  return (
    <section id="delivery" className="border-t border-brand-line py-10">
      <div className="mx-auto max-w-6xl px-4">
        <h2 className="mb-6 text-lg font-semibold text-brand-text">Delivery & returns</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <article className="rounded-2xl border border-brand-line bg-brand-surface p-5">
            <h3 className="text-sm font-semibold text-brand-text">Delivery — quoted per order</h3>
            <p className="mt-2 text-xs leading-relaxed text-brand-muted">
              Dispatch is estimated at 3 working days and confirmed on the WhatsApp quote based on production readiness at the moment of order. After dispatch, pick sea freight (4–6 weeks transit) or air freight (5–6 days transit worldwide — UK, USA, Australia, EU). Cost depends on your country and the items in your cart — we confirm today's rate direct on WhatsApp before you pay.
            </p>
          </article>

          <article className="rounded-2xl border border-brand-line bg-brand-surface p-5">
            <h3 className="text-sm font-semibold text-brand-text">Dispatch</h3>
            <p className="mt-2 text-xs leading-relaxed text-brand-muted">{dispatchText}</p>
          </article>

          <article className="rounded-2xl border border-brand-line bg-brand-surface p-5">
            <h3 className="text-sm font-semibold text-brand-text">Returns & warranty</h3>
            <p className="mt-2 text-xs leading-relaxed text-brand-muted">
              30-day return window from delivery, item in original condition. {warrantyYears}-year warranty against manufacturing defects (parts & labour). Service flow under <span className="text-brand-text">Warranty</span>.
            </p>
          </article>
        </div>
      </div>
    </section>
  );
}
