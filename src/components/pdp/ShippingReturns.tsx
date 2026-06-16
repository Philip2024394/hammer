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
            <h3 className="text-sm font-semibold text-brand-text">Two-tier shipping — UK · USA · Australia</h3>
            <p className="mt-2 text-xs leading-relaxed text-brand-muted">
              £30 minimum order. £28 shipping on £30–£49 orders, £20 flat once you reach £50. Dispatched within 3 working days via EMS Air Mail, 5–6 days transit. Tracked end-to-end. Shipping to other countries is confirmed on WhatsApp after checkout. Import duties and local taxes are the buyer&apos;s responsibility on arrival.
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
