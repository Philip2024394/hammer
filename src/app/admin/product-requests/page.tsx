import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { ProductRequestActions } from "./Actions";

export const dynamic = "force-dynamic";

type Row = {
  id: string;
  reference: string;
  buyer_name: string;
  buyer_email: string;
  buyer_phone: string;
  buyer_country: string;
  quantity: string;
  details: string;
  admin_notes: string | null;
  responded_at: string | null;
  closed_at: string | null;
  created_at: string;
};

const TABS = [
  { v: "pending",   label: "Pending"   },
  { v: "responded", label: "Responded" },
  { v: "closed",    label: "Closed"    }
] as const;

type Tab = (typeof TABS)[number]["v"];

function isTab(v: string | undefined): v is Tab {
  return v === "pending" || v === "responded" || v === "closed";
}

export default async function AdminProductRequestsPage({
  searchParams
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const active: Tab = isTab(status) ? status : "pending";

  const [rowsRes, countsRes] = await Promise.all([
    supabaseAdmin
      .from("hammerex_product_requests")
      .select("id, reference, buyer_name, buyer_email, buyer_phone, buyer_country, quantity, details, admin_notes, responded_at, closed_at, created_at")
      .eq("status", active)
      .order("created_at", { ascending: false })
      .limit(200),
    supabaseAdmin.from("hammerex_product_requests").select("status")
  ]);

  const rows = (rowsRes.data ?? []) as Row[];
  const counts = { pending: 0, responded: 0, closed: 0 } as Record<Tab, number>;
  for (const r of (countsRes.data ?? []) as { status: Tab }[]) {
    if (counts[r.status] !== undefined) counts[r.status]++;
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-baseline justify-between gap-3">
        <h1 className="text-xl font-bold">Product requests</h1>
        <p className="text-xs text-brand-muted">
          Custom-spec, out-of-stock and bulk enquiries submitted from the &ldquo;Submit your project&rdquo; modal. Reply by email or phone, then mark Responded (or Closed).
        </p>
      </header>

      <nav className="flex flex-wrap gap-1">
        {TABS.map((t) => {
          const isActive = t.v === active;
          return (
            <a
              key={t.v}
              href={`/admin/product-requests?status=${t.v}`}
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
            const mailHref = `mailto:${r.buyer_email}?subject=${encodeURIComponent(`Hammerex project ${r.reference}`)}&body=${encodeURIComponent(`Hi ${r.buyer_name},\n\nThanks for your enquiry (${r.reference}). About your project:\n\n`)}`;
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
                      <a href={`tel:${r.buyer_phone.replace(/[^0-9+]/g, "")}`} className="text-brand-text hover:text-brand-accent">{r.buyer_phone}</a>
                      <span>·</span>
                      <span>{r.buyer_country}</span>
                    </div>
                  </div>

                  <div className="flex shrink-0 flex-col items-end gap-2">
                    <div className="text-right text-xs text-brand-muted">
                      Quantity
                      <div className="font-semibold text-brand-text">{r.quantity}</div>
                    </div>
                    <a
                      href={mailHref}
                      className="grid h-9 place-items-center rounded-full bg-brand-accent px-3 text-xs font-bold uppercase tracking-widest text-black hover:opacity-90"
                    >
                      Email customer
                    </a>
                    <ProductRequestActions id={r.id} status={active} />
                  </div>
                </div>

                <div className="mt-4 rounded-xl border border-brand-line bg-black/30 p-3">
                  <div className="mb-1 text-[10px] font-bold uppercase tracking-widest text-brand-muted">Project details</div>
                  <p className="whitespace-pre-line text-xs leading-relaxed text-brand-text">{r.details}</p>
                </div>

                {r.admin_notes && (
                  <div className="mt-3 rounded-xl border border-brand-line bg-black/30 p-3 text-xs leading-relaxed text-brand-muted">
                    <div className="mb-1 text-[10px] font-bold uppercase tracking-widest text-brand-accent">Internal note</div>
                    <div className="whitespace-pre-line text-brand-text">{r.admin_notes}</div>
                  </div>
                )}

                {(r.responded_at || r.closed_at) && (
                  <div className="mt-3 text-[11px] text-brand-muted">
                    {r.responded_at && <span>Responded {new Date(r.responded_at).toLocaleString()}</span>}
                    {r.responded_at && r.closed_at && <span> · </span>}
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
