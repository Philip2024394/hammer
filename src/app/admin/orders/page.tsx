import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { formatPrice } from "@/lib/fx";
import { OrderActions } from "./Actions";

export const dynamic = "force-dynamic";

type LineItem = {
  productId?: string | null;
  slug?: string | null;
  name: string;
  sku?: string | null;
  image?: string | null;
  unitPriceIdr: number;
  qty: number;
  size?: string | null;
  variantLabel?: string | null;
  threadColor?: string | null;
  backpackStraps?: boolean;
  beltSize?: string | null;
  beltUpgrade?: string | null;
  customBrandName?: string | null;
  repairCover?: boolean;
};

type QuoteRow = {
  id: string;
  reference: string;
  buyer_name: string;
  buyer_email: string;
  buyer_whatsapp: string;
  buyer_country: string;
  buyer_address: string | null;
  line_items: LineItem[];
  subtotal_idr: number;
  admin_notes: string | null;
  quoted_at: string | null;
  closed_at: string | null;
  created_at: string;
};

const TABS = [
  { v: "pending", label: "Pending" },
  { v: "quoted",  label: "Quoted"  },
  { v: "closed",  label: "Closed"  }
] as const;

type Tab = (typeof TABS)[number]["v"];

function isTab(v: string | undefined): v is Tab {
  return v === "pending" || v === "quoted" || v === "closed";
}

export default async function AdminOrdersPage({
  searchParams
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const active: Tab = isTab(status) ? status : "pending";

  const [rowsRes, countsRes] = await Promise.all([
    supabaseAdmin
      .from("hammerex_quote_requests")
      .select("id, reference, buyer_name, buyer_email, buyer_whatsapp, buyer_country, buyer_address, line_items, subtotal_idr, admin_notes, quoted_at, closed_at, created_at")
      .eq("status", active)
      .order("created_at", { ascending: false })
      .limit(200),
    supabaseAdmin.from("hammerex_quote_requests").select("status")
  ]);

  const rows = (rowsRes.data ?? []) as QuoteRow[];
  const counts = { pending: 0, quoted: 0, closed: 0 } as Record<Tab, number>;
  for (const r of (countsRes.data ?? []) as { status: Tab }[]) {
    if (counts[r.status] !== undefined) counts[r.status]++;
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-baseline justify-between gap-3">
        <h1 className="text-xl font-bold">Quote requests</h1>
        <p className="text-xs text-brand-muted">
          Customers submit through the checkout form. Reply by email (or call), then mark the row Quoted (or Closed if the deal&rsquo;s settled).
        </p>
      </header>

      <nav className="flex flex-wrap gap-1">
        {TABS.map((t) => {
          const isActive = t.v === active;
          return (
            <a
              key={t.v}
              href={`/admin/orders?status=${t.v}`}
              aria-current={isActive ? "page" : undefined}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-widest transition ${
                isActive
                  ? "bg-brand-accent text-black"
                  : "border border-brand-line bg-brand-surface text-brand-muted hover:border-brand-accent hover:text-brand-text"
              }`}
            >
              {t.label} <span className="ml-1 text-[10px] opacity-70">({counts[t.v]})</span>
            </a>
          );
        })}
      </nav>

      {rows.length === 0 ? (
        <p className="rounded-xl border border-dashed border-brand-line bg-brand-surface p-6 text-center text-xs text-brand-muted">
          Nothing in {active}.
        </p>
      ) : (
        <ol className="flex flex-col gap-4">
          {rows.map((r) => {
            const mailHref = `mailto:${r.buyer_email}?subject=${encodeURIComponent(`Hammerex quote ${r.reference}`)}&body=${encodeURIComponent(`Hi ${r.buyer_name},\n\nThanks for your Hammerex order (${r.reference}). Here is your delivery quote:\n\n`)}`;
            const totalQty = r.line_items.reduce((s, l) => s + (l.qty || 0), 0);

            return (
              <li key={r.id} className="rounded-2xl border border-brand-line bg-brand-surface p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-sm font-bold text-brand-accent">{r.reference}</span>
                      <span className="text-xs text-brand-muted">·</span>
                      <span className="text-xs text-brand-muted">{new Date(r.created_at).toLocaleString()}</span>
                    </div>
                    <h3 className="mt-1 text-base font-semibold text-brand-text">{r.buyer_name}</h3>
                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-brand-muted">
                      <a href={mailHref} className="text-brand-text hover:text-brand-accent">{r.buyer_email}</a>
                      <span>·</span>
                      <a href={`tel:${r.buyer_whatsapp.replace(/[^0-9+]/g, "")}`} className="text-brand-text hover:text-brand-accent">{r.buyer_whatsapp}</a>
                      <span>·</span>
                      <span>{r.buyer_country}</span>
                    </div>
                    {r.buyer_address && (
                      <div className="mt-2 max-w-md whitespace-pre-line rounded-xl border border-brand-line bg-black/30 p-2 text-xs text-brand-text">
                        <span className="block text-[10px] font-bold uppercase tracking-widest text-brand-muted">Delivery address</span>
                        {r.buyer_address}
                      </div>
                    )}
                  </div>

                  <div className="flex shrink-0 flex-col items-end gap-2">
                    <div className="text-right text-xs text-brand-muted">
                      Items subtotal
                      <div className="font-semibold text-brand-text">{formatPrice(r.subtotal_idr, "IDR")}</div>
                      <div>{totalQty} item{totalQty === 1 ? "" : "s"} · delivery TBD</div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <a
                        href={mailHref}
                        className="grid h-9 place-items-center rounded-full bg-brand-accent px-3 text-xs font-bold uppercase tracking-widest text-black hover:opacity-90"
                      >
                        Email customer
                      </a>
                    </div>
                    <OrderActions id={r.id} status={active} />
                  </div>
                </div>

                <ul className="mt-4 divide-y divide-brand-line border-t border-brand-line">
                  {r.line_items.map((l, i) => (
                    <li key={`${r.id}-line-${i}`} className="flex items-start gap-3 py-3 text-xs">
                      <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-black">
                        {l.image && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={l.image} alt={l.name} loading="lazy" className="h-full w-full object-contain" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-brand-text">{l.name}</span>
                          {l.slug && (
                            <a href={`/product/${l.slug}`} target="_blank" rel="noopener noreferrer" className="text-[11px] text-brand-accent hover:underline">PDP →</a>
                          )}
                        </div>
                        {l.sku && <div className="text-brand-accent">Ref: {l.sku}</div>}
                        {l.variantLabel && <div className="text-brand-muted">Variant: {l.variantLabel}</div>}
                        {l.size && <div className="text-brand-muted">Size: {l.size}</div>}
                        {l.beltSize && <div className="text-brand-muted">Belt size: {l.beltSize}</div>}
                        {l.beltUpgrade && <div className="text-brand-muted">Belt upgrade: {l.beltUpgrade}</div>}
                        {l.threadColor && <div className="text-brand-muted">Thread: {l.threadColor}</div>}
                        {l.customBrandName && <div className="text-brand-muted">Branding: {l.customBrandName}</div>}
                        {l.backpackStraps && <div className="text-brand-muted">+ Backpack straps add-on</div>}
                        {l.repairCover && <div className="text-brand-muted">+ 3-Year Pro Repair Cover</div>}
                      </div>
                      <div className="shrink-0 text-right">
                        <div className="font-semibold text-brand-text">{l.qty}× {formatPrice(l.unitPriceIdr, "IDR")}</div>
                        <div className="text-brand-muted">{formatPrice(l.unitPriceIdr * l.qty, "IDR")}</div>
                      </div>
                    </li>
                  ))}
                </ul>

                {r.admin_notes && (
                  <div className="mt-3 rounded-xl border border-brand-line bg-black/30 p-3 text-xs leading-relaxed text-brand-muted">
                    <div className="mb-1 text-[10px] font-bold uppercase tracking-widest text-brand-accent">Internal note</div>
                    <div className="whitespace-pre-line text-brand-text">{r.admin_notes}</div>
                  </div>
                )}

                {(r.quoted_at || r.closed_at) && (
                  <div className="mt-3 text-[11px] text-brand-muted">
                    {r.quoted_at && <span>Quoted {new Date(r.quoted_at).toLocaleString()}</span>}
                    {r.quoted_at && r.closed_at && <span> · </span>}
                    {r.closed_at && <span>Closed {new Date(r.closed_at).toLocaleString()}</span>}
                  </div>
                )}
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
