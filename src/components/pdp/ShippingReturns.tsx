export function ShippingReturns({ warrantyYears, dispatchLeadDays }: {
  warrantyYears: number;
  dispatchLeadDays: number;
}) {
  const dispatchText = dispatchLeadDays > 0
    ? `Orders dispatch within ${dispatchLeadDays} working day${dispatchLeadDays === 1 ? "" : "s"} of confirmation. Tracking link on dispatch.`
    : `Orders placed before 2:00 PM Jakarta time (WIB) ship the same day. Later orders dispatch the next business day. Tracking link on dispatch.`;

  return (
    <section id="delivery" className="border-t border-brand-line py-6">
      <div className="mx-auto max-w-6xl px-4">
        <details className="group">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 py-3">
            <h2 className="text-lg font-semibold text-brand-text">Delivery &amp; returns</h2>
            <span aria-hidden="true" className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-accent text-black transition group-open:rotate-180">▾</span>
          </summary>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <article className="rounded-2xl border border-brand-line bg-brand-surface p-5">
            <h3 className="text-sm font-semibold text-brand-text">Two-tier shipping — UK · USA · Australia</h3>
            <p className="mt-2 text-xs leading-relaxed text-brand-muted">
              £28 shipping under £50, £20 flat once you reach £50. Dispatched within 3 working days via EMS Air Mail, 5–6 days transit. Tracked end-to-end. Shipping to other countries is confirmed on WhatsApp after checkout. Import duties and local taxes are the buyer&apos;s responsibility on arrival.
            </p>
          </article>

          <article className="rounded-2xl border border-brand-line bg-brand-surface p-5">
            <h3 className="text-sm font-semibold text-brand-text">Dispatch</h3>
            <p className="mt-2 text-xs leading-relaxed text-brand-muted">{dispatchText}</p>
          </article>

          <article className="rounded-2xl border border-brand-line bg-brand-surface p-5">
            <h3 className="text-sm font-semibold text-brand-text">Returns &amp; warranty</h3>
            <p className="mt-2 text-xs leading-relaxed text-brand-muted">
              If you&apos;re unhappy with your order, you have <span className="text-brand-text">72 hours from receipt</span> to send it back. Return the item <span className="text-brand-text">unused, in its original packaging</span>, with your invoice and the reason for return enclosed. Once we receive and inspect the item, we&apos;ll reimburse the <span className="text-brand-text">full product price</span>. The delivery charge is <span className="text-brand-text">not refunded</span> — shipping is fulfilled by an independent courier and that service has already been provided, so the cost is not held by Hammerex. {warrantyYears}-year warranty against manufacturing defects (parts &amp; labour) — see <span className="text-brand-text">Warranty</span>.
            </p>
          </article>
          </div>
        </details>
      </div>
    </section>
  );
}
