import type { HammerexShippingZone } from "@/lib/supabase";
import { formatPrice } from "@/lib/fx";

export function ShippingReturns({ zones, weightKg, warrantyYears }: {
  zones: HammerexShippingZone[];
  weightKg: number;
  warrantyYears: number;
}) {
  return (
    <section id="shipping" className="border-t border-brand-line py-10">
      <div className="mx-auto max-w-6xl px-4">
        <h2 className="mb-6 text-lg font-semibold text-brand-text">Shipping & returns</h2>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <article className="rounded-2xl border border-brand-line bg-brand-surface p-5">
            <h3 className="text-sm font-semibold text-brand-text">Dispatch</h3>
            <p className="mt-2 text-xs leading-relaxed text-brand-muted">
              Orders placed before <span className="text-brand-text">2:00 PM Jakarta time (WIB)</span> ship the same day. Later orders dispatch the next business day. Tracking link on dispatch.
            </p>
          </article>

          <article className="rounded-2xl border border-brand-line bg-brand-surface p-5 lg:col-span-2">
            <h3 className="text-sm font-semibold text-brand-text">Destinations</h3>
            <div className="mt-3 overflow-hidden rounded-xl border border-brand-line">
              <table className="w-full text-xs">
                <thead className="bg-black/30 text-brand-muted">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium">Country</th>
                    <th className="px-3 py-2 text-left font-medium">Carrier</th>
                    <th className="px-3 py-2 text-left font-medium">ETA</th>
                    <th className="px-3 py-2 text-right font-medium">Indicative cost</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-line">
                  {zones.map((z) => (
                    <tr key={z.country_code}>
                      <td className="px-3 py-2 text-brand-text">{z.country_name}</td>
                      <td className="px-3 py-2 text-brand-muted">{z.carrier}</td>
                      <td className="px-3 py-2 text-brand-muted">{z.eta_min_days}–{z.eta_max_days} business days</td>
                      <td className="px-3 py-2 text-right text-brand-text">
                        {formatPrice(z.base_fee_idr + Math.ceil(weightKg) * z.per_kg_idr, "IDR")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-xs text-brand-muted">Duties & taxes calculated at checkout. Customs delays may add 1–3 days.</p>
          </article>

          <article className="rounded-2xl border border-brand-line bg-brand-surface p-5">
            <h3 className="text-sm font-semibold text-brand-text">Returns</h3>
            <p className="mt-2 text-xs leading-relaxed text-brand-muted">
              30-day return window from delivery. Item must be in original condition with packaging. Return shipping at buyer's cost for international orders.
            </p>
          </article>

          <article className="rounded-2xl border border-brand-line bg-brand-surface p-5 lg:col-span-2">
            <h3 className="text-sm font-semibold text-brand-text">Warranty</h3>
            <p className="mt-2 text-xs leading-relaxed text-brand-muted">
              {warrantyYears}-year limited warranty against manufacturing defects (parts & labour). Register your serial number within 30 days for the full term. Service centre map and claim flow under <span className="text-brand-text">Support</span>.
            </p>
          </article>
        </div>
      </div>
    </section>
  );
}
