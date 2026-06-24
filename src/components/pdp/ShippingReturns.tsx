// Owner rule (2026-06-23): no £-pegged shipping tiers shown to customers.
// Delivery is always quoted by the Hammerex team after checkout for the
// whole order as a single package. `shippingPerUnitIdr` is still accepted
// as a prop (kept on PDP for back-compat with callers) but no longer
// drives a per-product copy variant.

export function ShippingReturns({
  warrantyYears,
  dispatchLeadDays,
  shippingPerUnitIdr
}: {
  warrantyYears: number;
  dispatchLeadDays: number;
  shippingPerUnitIdr?: number | null;
}) {
  // Uniform Hammerex dispatch policy (2026-06-22): every product ships
  // in 4–5 working days regardless of per-product dispatch_lead_days,
  // since we batch orders for the daily carrier collection.
  void dispatchLeadDays;
  void shippingPerUnitIdr;
  const dispatchText = `Orders dispatch in 4–5 working days from confirmation. Tracking link on dispatch.`;

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
            <h3 className="text-sm font-semibold text-brand-text">Quoted by the Hammerex team within 24 hours</h3>
            <p className="mt-2 text-xs leading-relaxed text-brand-muted">
              After checkout the team calculates the <span className="text-brand-text">best combined rate</span> for your whole order as a single package — never per item — and replies by email or phone, usually within 24 hours. You only pay once you have seen and accepted the delivery quote. Carrier-estimated air freight transit <span className="text-brand-text">~5–7 days</span> to most countries; sea freight (most countries) is approximately <span className="text-brand-text">3–4 weeks</span> and varies country to country. Import duties and local taxes are the buyer&apos;s responsibility on arrival.
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
