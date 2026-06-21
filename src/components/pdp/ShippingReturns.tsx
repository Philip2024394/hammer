// Two shipping policies coexist on the storefront:
//   1. Two-tier (£28 under £50, £20 flat 50+) — used by carts/products
//      that fall back to lib/shipping.ts via shippingPerUnitIdr === null.
//   2. Per-product override (Free UK + £10/unit international) — used
//      when the product row sets shipping_per_unit_idr = 0. BuyColumn
//      implements this at runtime (lines 235-242).
//
// This block must match whichever policy actually applies to the
// product the buyer is reading about, otherwise the buy column and the
// delivery copy contradict each other.

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
  const dispatchText = `Orders dispatch in 4–5 working days from confirmation. Tracking link on dispatch.`;

  const freeUkProduct = shippingPerUnitIdr === 0;

  return (
    <section id="delivery" className="border-t border-brand-line py-6">
      <div className="mx-auto max-w-6xl px-4">
        <details className="group">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 py-3">
            <h2 className="text-lg font-semibold text-brand-text">Delivery &amp; returns</h2>
            <span aria-hidden="true" className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-accent text-black transition group-open:rotate-180">▾</span>
          </summary>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {freeUkProduct ? (
            <article className="rounded-2xl border border-brand-line bg-brand-surface p-5">
              <h3 className="text-sm font-semibold text-brand-text">Free UK delivery · +£10/unit international</h3>
              <p className="mt-2 text-xs leading-relaxed text-brand-muted">
                Free delivery to UK addresses. Carrier-estimated air freight transit <span className="text-brand-text">~5–7 days</span>, tracked end-to-end. Buyers outside the UK pay a flat <span className="text-brand-text">+£10 per unit</span> air-freight surcharge, added automatically when a non-UK delivery address is detected. Sea freight (most countries) is approximately <span className="text-brand-text">3–4 weeks</span> and varies country to country. Import duties and local taxes are the buyer&apos;s responsibility on arrival.
              </p>
            </article>
          ) : (
            <article className="rounded-2xl border border-brand-line bg-brand-surface p-5">
              <h3 className="text-sm font-semibold text-brand-text">Two-tier shipping — UK · USA · Australia</h3>
              <p className="mt-2 text-xs leading-relaxed text-brand-muted">
                £28 shipping under £50, £20 flat once you reach £50. Dispatched in <span className="text-brand-text">4–5 working days</span>. Carrier-estimated air freight transit <span className="text-brand-text">~5–7 days</span>, tracked end-to-end. Sea freight (most countries) is approximately <span className="text-brand-text">3–4 weeks</span> and varies country to country. Shipping to other countries is confirmed on WhatsApp after checkout. Import duties and local taxes are the buyer&apos;s responsibility on arrival.
              </p>
            </article>
          )}

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
