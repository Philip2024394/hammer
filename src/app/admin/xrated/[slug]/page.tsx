// Per-member Xrated drill-in. Shows the listing's 30-day view stats,
// payment history, recent page views, a tiny inline "mark paid" form
// and tier-override buttons. Server-rendered; the forms POST to small
// API routes under /api/admin/xrated/*.

import Link from "next/link";
import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getListingViewStats } from "@/lib/xratedAnalytics";
import {
  effectiveTier,
  trialDaysRemaining,
  XRATED_PRICING,
  type XratedTier
} from "@/lib/xratedTrades";
import { tradeLabel } from "@/lib/tradeOff";
import { formatMinutes } from "../../helpers";
import { WhatsAppIconButton } from "@/components/admin/WhatsAppIconButton";
import { TierPill } from "../TierPill";
import type {
  HammerexTradeOffListing,
  HammerexXratedPayment,
  HammerexXratedView
} from "@/lib/supabase";

export const dynamic = "force-dynamic";

const FULL_LISTING_COLUMNS =
  "id, slug, display_name, trading_name, primary_trade, secondary_trades, city, country, whatsapp, phone, email, avatar_url, status, tier, trial_started_at, trial_expires_at, paid_expires_at, last_payment_plan, joined_at, created_at, updated_at";

type ListingLite = Pick<
  HammerexTradeOffListing,
  | "id"
  | "slug"
  | "display_name"
  | "trading_name"
  | "primary_trade"
  | "secondary_trades"
  | "city"
  | "country"
  | "whatsapp"
  | "phone"
  | "email"
  | "avatar_url"
  | "status"
  | "tier"
  | "trial_started_at"
  | "trial_expires_at"
  | "paid_expires_at"
  | "last_payment_plan"
  | "joined_at"
  | "created_at"
  | "updated_at"
>;

export default async function AdminXratedDetailPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const listingRes = await supabaseAdmin
    .from("hammerex_trade_off_listings")
    .select(FULL_LISTING_COLUMNS)
    .eq("slug", slug)
    .maybeSingle();

  if (listingRes.error || !listingRes.data) {
    notFound();
  }
  const listing = listingRes.data as ListingLite;

  // Edit-token sits on the listings table but isn't in the type. Fetch
  // it on demand so the "Edit on site" link works.
  const tokenRes = await supabaseAdmin
    .from("hammerex_trade_off_listings")
    .select("edit_token")
    .eq("id", listing.id)
    .maybeSingle();
  const editToken = (tokenRes.data as { edit_token: string | null } | null)
    ?.edit_token;

  const [stats, paymentsRes, viewsRes] = await Promise.all([
    getListingViewStats(listing.id, 30),
    supabaseAdmin
      .from("hammerex_xrated_payments")
      .select(
        "id, listing_id, plan, amount_gbp, paid_at, paid_via, admin_note, expires_at, created_at"
      )
      .eq("listing_id", listing.id)
      .order("paid_at", { ascending: false })
      .limit(100),
    supabaseAdmin
      .from("hammerex_xrated_views")
      .select(
        "id, listing_id, page, session_id, ip_hash, country, city, referrer, user_agent, viewed_at, ended_at, duration_seconds"
      )
      .eq("listing_id", listing.id)
      .order("viewed_at", { ascending: false })
      .limit(200)
  ]);

  const payments = (paymentsRes.data ?? []) as HammerexXratedPayment[];
  const views = (viewsRes.data ?? []) as HammerexXratedView[];

  const tier = effectiveTier({
    tier: listing.tier as XratedTier,
    trial_expires_at: listing.trial_expires_at
  });
  const daysLeft = trialDaysRemaining(listing.trial_expires_at);

  const topPage =
    Object.entries(stats.views_by_page)
      .sort((a, b) => b[1] - a[1])
      .map(([page, count]) => `${page} (${count})`)[0] ?? "—";

  const maxDayCount = stats.views_by_day.reduce(
    (m, d) => Math.max(m, d.count),
    0
  );
  const maxPageCount = Object.values(stats.views_by_page).reduce(
    (m, c) => Math.max(m, c),
    0
  );
  const pagesByCount = Object.entries(stats.views_by_page).sort(
    (a, b) => b[1] - a[1]
  );

  const recentViews = views.slice(0, 50);

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/admin/xrated"
        className="text-xs text-brand-muted hover:text-brand-accent"
      >
        &larr; All members
      </Link>

      <header className="flex flex-wrap items-center gap-4 rounded-2xl border border-brand-line bg-brand-surface p-5">
        <Avatar src={listing.avatar_url} name={listing.display_name} large />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="truncate text-xl font-bold text-brand-text">
              {listing.display_name}
            </h1>
            <TierPill tier={tier} />
            <StatusPill status={listing.status} />
          </div>
          <div className="mt-1 text-xs text-brand-muted">
            {tradeLabel(listing.primary_trade)} &middot; {listing.city}
            {listing.country ? `, ${listing.country}` : ""}
            {listing.trading_name && (
              <>
                {" "}
                &middot; <span>{listing.trading_name}</span>
              </>
            )}
          </div>
          <div className="mt-1 text-xs text-brand-muted">
            {listing.email}
            {listing.phone ? ` · ${listing.phone}` : ""}
            {listing.whatsapp ? ` · WA ${listing.whatsapp}` : ""}
          </div>
          {tier === "app_trial" && daysLeft !== null && (
            <div className="mt-1 text-xs text-yellow-300">
              Trial: {daysLeft} day{daysLeft === 1 ? "" : "s"} remaining
            </div>
          )}
          {tier === "app_paid" && listing.paid_expires_at && (
            <div className="mt-1 text-xs text-emerald-300">
              Paid through {shortDate(listing.paid_expires_at)} (
              {listing.last_payment_plan ?? "—"})
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <WhatsAppIconButton
            whatsapp={listing.whatsapp}
            name={listing.display_name}
          />
          {editToken && (
            <a
              href={`/trade-off/edit/${listing.slug}?token=${editToken}`}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-brand-line bg-brand-bg px-3 py-2 text-xs font-semibold uppercase tracking-widest text-brand-text hover:border-brand-accent hover:text-brand-accent"
            >
              Edit on site
            </a>
          )}
          <a
            href={`/trade-off/${listing.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full border border-brand-line bg-brand-bg px-3 py-2 text-xs font-semibold uppercase tracking-widest text-brand-text hover:border-brand-accent hover:text-brand-accent"
          >
            View profile
          </a>
        </div>
      </header>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        <Kpi label="Views (30d)" value={stats.total_views.toString()} />
        <Kpi label="Sessions (30d)" value={stats.unique_sessions.toString()} />
        <Kpi
          label="Avg time"
          value={formatMinutes(stats.avg_duration_seconds)}
        />
        <Kpi label="Top page" value={topPage} small />
        <Kpi
          label="Last viewed"
          value={
            stats.last_viewed_at ? relativeTime(stats.last_viewed_at) : "—"
          }
        />
      </div>

      <Panel title="Mark as paid">
        <form
          action="/api/admin/xrated/flip-paid"
          method="post"
          className="flex flex-wrap items-end gap-3"
        >
          <input type="hidden" name="slug" value={listing.slug} />
          <Field label="Plan">
            <select
              name="plan"
              defaultValue="monthly"
              className="rounded-lg border border-brand-line bg-brand-bg px-3 py-2 text-sm text-brand-text"
            >
              <option value="monthly">
                Monthly · &pound;{XRATED_PRICING.monthlyGbp}
              </option>
              <option value="annual">
                Annual · &pound;{XRATED_PRICING.annualGbp}
              </option>
            </select>
          </Field>
          <Field label="Amount override (GBP)">
            <input
              type="number"
              name="amount_gbp"
              step="0.01"
              min="0"
              placeholder="(plan default)"
              className="w-40 rounded-lg border border-brand-line bg-brand-bg px-3 py-2 text-sm text-brand-text"
            />
          </Field>
          <Field label="Admin note (optional)">
            <input
              type="text"
              name="admin_note"
              maxLength={500}
              placeholder="e.g. paid via WA transfer"
              className="w-64 rounded-lg border border-brand-line bg-brand-bg px-3 py-2 text-sm text-brand-text"
            />
          </Field>
          <button
            type="submit"
            className="rounded-full bg-emerald-500 px-4 py-2 text-xs font-bold uppercase tracking-widest text-emerald-950 hover:opacity-90"
          >
            Mark paid
          </button>
        </form>
        <p className="mt-2 text-xs text-brand-muted">
          Inserts a payment row and flips this listing to{" "}
          <code className="rounded bg-brand-bg px-1.5 py-0.5 font-mono text-[11px] text-brand-accent">
            app_paid
          </code>
          . Expiry: +30 days (monthly) or +365 days (annual).
        </p>
      </Panel>

      <Panel title="Tier actions">
        <div className="flex flex-wrap gap-3">
          <form
            action="/api/admin/xrated/set-tier"
            method="post"
            className="inline-flex items-center gap-2"
          >
            <input type="hidden" name="slug" value={listing.slug} />
            <input type="hidden" name="tier" value="app_trial" />
            <input type="hidden" name="extend_days" value="30" />
            <button
              type="submit"
              className="rounded-full border border-yellow-500/40 bg-yellow-500/10 px-3 py-2 text-xs font-bold uppercase tracking-widest text-yellow-300 hover:bg-yellow-500/20"
            >
              Extend trial 30 days
            </button>
          </form>
          <form
            action="/api/admin/xrated/set-tier"
            method="post"
            className="inline-flex items-center gap-2"
          >
            <input type="hidden" name="slug" value={listing.slug} />
            <input type="hidden" name="tier" value="standard" />
            <button
              type="submit"
              className="rounded-full border border-brand-line bg-brand-bg px-3 py-2 text-xs font-bold uppercase tracking-widest text-brand-text hover:border-brand-accent hover:text-brand-accent"
            >
              Move to Standard
            </button>
          </form>
          <form
            action="/api/admin/xrated/set-tier"
            method="post"
            className="inline-flex items-center gap-2"
          >
            <input type="hidden" name="slug" value={listing.slug} />
            <input type="hidden" name="tier" value="app_expired" />
            <button
              type="submit"
              className="rounded-full border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs font-bold uppercase tracking-widest text-red-300 hover:bg-red-500/20"
            >
              Force expired
            </button>
          </form>
        </div>
      </Panel>

      <Panel title="Payments history">
        {payments.length === 0 ? (
          <Empty>No payments recorded yet.</Empty>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-brand-line">
            <table className="min-w-full divide-y divide-brand-line text-sm">
              <thead className="bg-brand-bg text-xs uppercase tracking-widest text-brand-muted">
                <tr>
                  <Th>Paid</Th>
                  <Th>Plan</Th>
                  <Th className="text-right">Amount (GBP)</Th>
                  <Th>Via</Th>
                  <Th>Note</Th>
                  <Th>Expires</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-line">
                {payments.map((p) => (
                  <tr key={p.id}>
                    <Td>{shortDate(p.paid_at)}</Td>
                    <Td className="capitalize">{p.plan}</Td>
                    <Td className="text-right tabular-nums">
                      {p.amount_gbp.toFixed(2)}
                    </Td>
                    <Td>{p.paid_via}</Td>
                    <Td className="max-w-[24ch] truncate text-xs text-brand-muted">
                      {p.admin_note ?? "—"}
                    </Td>
                    <Td>{shortDate(p.expires_at)}</Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      <Panel title="Views over time (30d)">
        {stats.views_by_day.length === 0 ? (
          <Empty>No views yet.</Empty>
        ) : (
          <ul className="flex flex-col gap-1">
            {stats.views_by_day.map((d) => (
              <li key={d.date} className="flex items-center gap-3 text-xs">
                <span className="w-20 shrink-0 text-brand-muted tabular-nums">
                  {d.date}
                </span>
                <span className="h-3 flex-1 overflow-hidden rounded-full bg-brand-bg">
                  <span
                    className="block h-full bg-brand-accent"
                    style={{
                      width: `${
                        maxDayCount > 0 ? (d.count / maxDayCount) * 100 : 0
                      }%`
                    }}
                  />
                </span>
                <span className="w-10 shrink-0 text-right tabular-nums text-brand-text">
                  {d.count}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <Panel title="Views by page (30d)">
        {pagesByCount.length === 0 ? (
          <Empty>No views yet.</Empty>
        ) : (
          <ul className="flex flex-col gap-1">
            {pagesByCount.map(([page, count]) => (
              <li key={page} className="flex items-center gap-3 text-xs">
                <span className="w-32 shrink-0 truncate text-brand-text">
                  {page}
                </span>
                <span className="h-3 flex-1 overflow-hidden rounded-full bg-brand-bg">
                  <span
                    className="block h-full bg-brand-accent"
                    style={{
                      width: `${
                        maxPageCount > 0 ? (count / maxPageCount) * 100 : 0
                      }%`
                    }}
                  />
                </span>
                <span className="w-10 shrink-0 text-right tabular-nums text-brand-text">
                  {count}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <Panel title="Recent page views">
        {recentViews.length === 0 ? (
          <Empty>No views yet.</Empty>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-brand-line">
            <table className="min-w-full divide-y divide-brand-line text-sm">
              <thead className="bg-brand-bg text-xs uppercase tracking-widest text-brand-muted">
                <tr>
                  <Th>Viewed</Th>
                  <Th>Page</Th>
                  <Th>Country</Th>
                  <Th>City</Th>
                  <Th className="text-right">Time on page</Th>
                  <Th>Session</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-line">
                {recentViews.map((v) => (
                  <tr key={v.id}>
                    <Td className="text-xs text-brand-muted">
                      {relativeTime(v.viewed_at)}
                    </Td>
                    <Td>{v.page}</Td>
                    <Td>{v.country ?? "—"}</Td>
                    <Td>{v.city ?? "—"}</Td>
                    <Td className="text-right tabular-nums">
                      {formatMinutes(v.duration_seconds ?? 0)}
                    </Td>
                    <Td className="font-mono text-xs text-brand-muted">
                      {(v.session_id ?? "—").slice(0, 8)}
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </div>
  );
}

function Kpi({
  label,
  value,
  small = false
}: {
  label: string;
  value: string;
  small?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-brand-line bg-brand-surface p-5">
      <div className="text-xs font-semibold uppercase tracking-widest text-brand-muted">
        {label}
      </div>
      <div
        className={`mt-1 font-bold text-brand-text tabular-nums ${
          small ? "text-sm" : "text-2xl"
        }`}
      >
        {value}
      </div>
    </div>
  );
}

function Panel({
  title,
  children
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-brand-line bg-brand-surface p-5">
      <h2 className="mb-3 text-sm font-bold uppercase tracking-widest text-brand-text">
        {title}
      </h2>
      {children}
    </section>
  );
}

function Field({
  label,
  children
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1 text-xs text-brand-muted">
      <span className="uppercase tracking-widest">{label}</span>
      {children}
    </label>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-xl border border-dashed border-brand-line p-3 text-xs text-brand-muted">
      {children}
    </p>
  );
}

function Th({
  children,
  className = ""
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <th
      className={`whitespace-nowrap px-3 py-2 text-left font-semibold ${className}`}
    >
      {children}
    </th>
  );
}

function Td({
  children,
  className = ""
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <td className={`whitespace-nowrap px-3 py-3 align-middle ${className}`}>
      {children}
    </td>
  );
}

function Avatar({
  src,
  name,
  large = false
}: {
  src: string | null;
  name: string;
  large?: boolean;
}) {
  const size = large ? "h-16 w-16" : "h-9 w-9";
  const initial = (name?.[0] ?? "?").toUpperCase();
  if (!src) {
    return (
      <span
        className={`inline-flex ${size} shrink-0 items-center justify-center rounded-full bg-brand-bg text-lg font-bold text-brand-muted`}
      >
        {initial}
      </span>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={name}
      className={`${size} shrink-0 rounded-full object-cover`}
    />
  );
}

function StatusPill({ status }: { status: ListingLite["status"] }) {
  const cfg: Record<ListingLite["status"], string> = {
    live: "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30",
    draft: "bg-brand-bg text-brand-muted border border-brand-line",
    hidden: "bg-red-500/15 text-red-300 border border-red-500/30"
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-widest ${cfg[status]}`}
    >
      {status}
    </span>
  );
}

function shortDate(iso: string): string {
  const d = new Date(iso);
  if (!Number.isFinite(d.getTime())) return "—";
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "2-digit"
  });
}

function relativeTime(iso: string): string {
  const t = new Date(iso).getTime();
  if (!Number.isFinite(t)) return "—";
  const diff = Date.now() - t;
  const sec = Math.max(1, Math.floor(diff / 1000));
  if (sec < 60) return `${sec}s ago`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  if (day < 30) return `${day}d ago`;
  return shortDate(iso);
}
