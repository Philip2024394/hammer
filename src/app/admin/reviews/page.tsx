import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { ReviewModerationActions } from "./Actions";

export const dynamic = "force-dynamic";

type PendingRow = {
  id: string;
  product_id: string;
  reviewer_name: string;
  reviewer_country: string | null;
  reviewer_whatsapp: string | null;
  rating: number;
  pillars: Record<string, number> | null;
  title: string | null;
  body: string | null;
  photos: string[] | null;
  created_at: string;
};

type ProductInfo = { slug: string | null; name: string };

const TABS = [
  { v: "pending",  label: "Pending"  },
  { v: "approved", label: "Approved" },
  { v: "rejected", label: "Rejected" }
] as const;

type Tab = (typeof TABS)[number]["v"];

function isTab(v: string | undefined): v is Tab {
  return v === "pending" || v === "approved" || v === "rejected";
}

export default async function AdminReviewsPage({
  searchParams
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const active: Tab = isTab(status) ? status : "pending";

  const [reviewsRes, countsRes] = await Promise.all([
    supabaseAdmin
      .from("hammerex_reviews")
      .select("id, product_id, reviewer_name, reviewer_country, reviewer_whatsapp, rating, pillars, title, body, photos, created_at")
      .eq("status", active)
      .order("created_at", { ascending: false })
      .limit(200),
    supabaseAdmin.from("hammerex_reviews").select("status")
  ]);

  const rows = (reviewsRes.data ?? []) as PendingRow[];

  const counts = { pending: 0, approved: 0, rejected: 0 } as Record<Tab, number>;
  for (const r of (countsRes.data ?? []) as { status: Tab }[]) {
    if (counts[r.status] !== undefined) counts[r.status]++;
  }

  const productIds = Array.from(new Set(rows.map((r) => r.product_id)));
  const products = new Map<string, ProductInfo>();
  if (productIds.length > 0) {
    const prodRes = await supabaseAdmin
      .from("hammerex_products")
      .select("id, slug, name")
      .in("id", productIds);
    for (const p of (prodRes.data ?? []) as { id: string; slug: string | null; name: string }[]) {
      products.set(p.id, { slug: p.slug, name: p.name });
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-baseline justify-between gap-3">
        <h1 className="text-xl font-bold">Review moderation</h1>
        <p className="text-xs text-brand-muted">
          Approved reviews go live on the PDP immediately. Rejected reviews stay here for audit.
        </p>
      </header>

      <nav className="flex flex-wrap gap-1">
        {TABS.map((t) => {
          const isActive = t.v === active;
          return (
            <a
              key={t.v}
              href={`/admin/reviews?status=${t.v}`}
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
          Nothing {active === "pending" ? "to review" : `in ${active}`}.
        </p>
      ) : (
        <ol className="flex flex-col gap-4">
          {rows.map((r) => {
            const product = products.get(r.product_id);
            const productHref = product?.slug ? `/product/${product.slug}` : null;
            return (
              <li key={r.id} className="rounded-2xl border border-brand-line bg-brand-surface p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 text-xs text-brand-muted">
                      {productHref ? (
                        <a href={productHref} target="_blank" rel="noopener noreferrer" className="font-semibold text-brand-accent hover:underline">
                          {product?.name ?? "(unknown product)"}
                        </a>
                      ) : (
                        <span className="font-semibold text-brand-text">{product?.name ?? "(unknown product)"}</span>
                      )}
                      <span>·</span>
                      <span>{new Date(r.created_at).toLocaleString()}</span>
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <Stars value={r.rating} />
                      <span className="text-xs text-brand-text">{r.rating}/5</span>
                    </div>
                  </div>
                  <ReviewModerationActions id={r.id} status={active} />
                </div>

                <div className="mt-3 grid grid-cols-1 gap-3 text-xs sm:grid-cols-3">
                  <Detail label="Name">{r.reviewer_name}</Detail>
                  <Detail label="Country">{r.reviewer_country ?? "—"}</Detail>
                  <Detail label="Phone">{r.reviewer_whatsapp ?? "—"}</Detail>
                </div>

                {r.pillars && Object.keys(r.pillars).length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2 text-xs">
                    {Object.entries(r.pillars).map(([k, v]) => (
                      <span key={k} className="rounded-full border border-brand-line bg-black/30 px-2 py-1 text-brand-muted">
                        <span className="font-semibold capitalize text-brand-text">{k}</span> {v}/5
                      </span>
                    ))}
                  </div>
                )}

                {r.title && <h3 className="mt-3 text-sm font-semibold text-brand-text">{r.title}</h3>}
                {r.body && <p className="mt-1 whitespace-pre-line text-xs leading-relaxed text-brand-muted">{r.body}</p>}

                {r.photos && r.photos.length > 0 && (
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {r.photos.map((src, i) => (
                      <li key={`${r.id}-${i}`}>
                        <a href={src} target="_blank" rel="noopener noreferrer" className="block h-24 w-24 overflow-hidden rounded-lg border border-brand-line bg-black transition hover:border-brand-accent">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={src} alt={`Photo ${i + 1} from ${r.reviewer_name}`} loading="lazy" className="h-full w-full object-cover" />
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}

function Detail({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[10px] font-semibold uppercase tracking-widest text-brand-muted">{label}</div>
      <div className="mt-0.5 truncate text-brand-text">{children}</div>
    </div>
  );
}

function Stars({ value }: { value: number }) {
  return (
    <span className="inline-flex" aria-label={`${value} stars`}>
      {[0, 1, 2, 3, 4].map((i) => (
        <svg key={i} width="14" height="14" viewBox="0 0 24 24" className="text-brand-accent" fill={i < value ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <polygon points="12,2 15,9 22,9 17,14 19,21 12,17 5,21 7,14 2,9 9,9" />
        </svg>
      ))}
    </span>
  );
}
