// Xrated Trades admin overview. Lists every member (live + draft + hidden)
// with their 30-day view stats and a WhatsApp button for the admin to
// reach out directly. Server-rendered. A simple GET form lets the admin
// filter by tier / trade / city without a client bundle.

import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getOverallStats, getListingViewStats } from "@/lib/xratedAnalytics";
import { effectiveTier, type XratedTier } from "@/lib/xratedTrades";
import { tradeLabel, TRADE_OFF_TRADES } from "@/lib/tradeOff";
import { formatMinutes } from "../helpers";
import { WhatsAppIconButton } from "@/components/admin/WhatsAppIconButton";
import { TierPill } from "./TierPill";
import type { HammerexTradeOffListing } from "@/lib/supabase";

export const dynamic = "force-dynamic";

type SearchParams = {
  tier?: string;
  trade?: string;
  city?: string;
};

const LISTING_COLUMNS =
  "id, slug, display_name, trading_name, primary_trade, city, country, whatsapp, avatar_url, status, tier, trial_started_at, trial_expires_at, paid_expires_at, last_payment_plan, joined_at, created_at";

type ListingRow = Pick<
  HammerexTradeOffListing,
  | "id"
  | "slug"
  | "display_name"
  | "trading_name"
  | "primary_trade"
  | "city"
  | "country"
  | "whatsapp"
  | "avatar_url"
  | "status"
  | "tier"
  | "trial_started_at"
  | "trial_expires_at"
  | "paid_expires_at"
  | "last_payment_plan"
  | "joined_at"
  | "created_at"
>;

export default async function AdminXratedPage({
  searchParams
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = (await searchParams) ?? {};
  const filterTier = (params.tier ?? "").trim();
  const filterTrade = (params.trade ?? "").trim();
  const filterCity = (params.city ?? "").trim();

  const overall = await getOverallStats(30);

  let q = supabaseAdmin
    .from("hammerex_trade_off_listings")
    .select(LISTING_COLUMNS)
    .order("created_at", { ascending: false })
    .limit(500);

  if (filterTier) q = q.eq("tier", filterTier);
  if (filterTrade) q = q.eq("primary_trade", filterTrade);
  if (filterCity) q = q.ilike("city", `%${filterCity}%`);

  const listingsRes = await q;
  const listings = (listingsRes.data ?? []) as ListingRow[];

  // Parallel per-listing view stats. We deliberately bound this at 500
  // rows above so we don't fan out arbitrarily wide.
  const stats = await Promise.all(
    listings.map((l) => getListingViewStats(l.id, 30))
  );

  const newThis30d = listings.filter((l) => {
    const created = new Date(l.created_at).getTime();
    return Number.isFinite(created) && created > Date.now() - 30 * 86400 * 1000;
  }).length;

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-baseline justify-between gap-3">
        <h1 className="text-xl font-bold">Xrated Trades</h1>
        <p className="text-xs text-brand-muted">
          Tradesperson directory + analytics. Members on App tier pay
          &pound;8/mo or &pound;80/yr; Standard tier is free for life.
          Tap the green icon to start a WhatsApp conversation.
        </p>
      </header>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <Kpi label="Total members" value={overall.total_signups.toString()} />
        <Kpi label="New (30d)" value={newThis30d.toString()} />
        <Kpi
          label="App tier"
          value={(overall.total_app_trial + overall.total_app_paid).toString()}
          sub={`${overall.total_app_paid} paid · ${overall.total_app_trial} trial`}
        />
        <Kpi label="Standard" value={overall.total_standard.toString()} />
        <Kpi label="Page views (30d)" value={overall.total_views.toString()} />
        <Kpi
          label="Unique sessions (30d)"
          value={overall.unique_sessions.toString()}
        />
      </div>

      <FilterForm tier={filterTier} trade={filterTrade} city={filterCity} />

      {listingsRes.error && (
        <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-xs text-red-300">
          Failed to load listings: {listingsRes.error.message}
        </div>
      )}

      {listings.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-brand-line p-8 text-center text-sm text-brand-muted">
          No members yet.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-brand-line bg-brand-surface">
          <table className="min-w-full divide-y divide-brand-line text-sm">
            <thead className="bg-brand-bg text-xs uppercase tracking-widest text-brand-muted">
              <tr>
                <Th>Member</Th>
                <Th>Trade</Th>
                <Th>City</Th>
                <Th>Tier</Th>
                <Th>Joined</Th>
                <Th className="text-right">Views 30d</Th>
                <Th className="text-right">Sessions 30d</Th>
                <Th className="text-right">Avg time</Th>
                <Th>Last viewed</Th>
                <Th className="text-right">Actions</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-line">
              {listings.map((l, i) => {
                const s = stats[i];
                const tier = effectiveTier({
                  tier: l.tier as XratedTier,
                  trial_expires_at: l.trial_expires_at
                });
                return (
                  <tr key={l.id} className="hover:bg-brand-bg/40">
                    <Td>
                      <div className="flex items-center gap-3">
                        <Avatar
                          src={l.avatar_url}
                          name={l.display_name}
                        />
                        <div className="min-w-0">
                          <div className="truncate font-semibold text-brand-text">
                            {l.display_name}
                          </div>
                          {l.trading_name && (
                            <div className="truncate text-xs text-brand-muted">
                              {l.trading_name}
                            </div>
                          )}
                        </div>
                      </div>
                    </Td>
                    <Td>{tradeLabel(l.primary_trade)}</Td>
                    <Td>{l.city}</Td>
                    <Td>
                      <TierPill tier={tier} />
                    </Td>
                    <Td>{shortDate(l.created_at)}</Td>
                    <Td className="text-right tabular-nums">{s.total_views}</Td>
                    <Td className="text-right tabular-nums">
                      {s.unique_sessions}
                    </Td>
                    <Td className="text-right tabular-nums">
                      {formatMinutes(s.avg_duration_seconds)}
                    </Td>
                    <Td className="text-xs text-brand-muted">
                      {s.last_viewed_at ? relativeTime(s.last_viewed_at) : "—"}
                    </Td>
                    <Td className="text-right">
                      <div className="inline-flex items-center gap-2">
                        <WhatsAppIconButton
                          whatsapp={l.whatsapp}
                          name={l.display_name}
                        />
                        <Link
                          href={`/admin/xrated/${l.slug}`}
                          title={`Open ${l.display_name}`}
                          aria-label={`Open ${l.display_name}`}
                          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-brand-line bg-brand-bg text-brand-muted transition hover:border-brand-accent hover:text-brand-accent"
                        >
                          <svg
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                          >
                            <path d="M9 18l6-6-6-6" />
                          </svg>
                        </Link>
                      </div>
                    </Td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Kpi({
  label,
  value,
  sub
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="rounded-2xl border border-brand-line bg-brand-surface p-5">
      <div className="text-xs font-semibold uppercase tracking-widest text-brand-muted">
        {label}
      </div>
      <div className="mt-1 text-2xl font-bold text-brand-text tabular-nums">
        {value}
      </div>
      {sub && <div className="mt-1 text-xs text-brand-muted">{sub}</div>}
    </div>
  );
}

function FilterForm({
  tier,
  trade,
  city
}: {
  tier: string;
  trade: string;
  city: string;
}) {
  return (
    <form
      action="/admin/xrated"
      method="get"
      className="flex flex-wrap items-end gap-3 rounded-2xl border border-brand-line bg-brand-surface p-4"
    >
      <Field label="Tier">
        <select
          name="tier"
          defaultValue={tier}
          className="rounded-lg border border-brand-line bg-brand-bg px-3 py-2 text-sm text-brand-text"
        >
          <option value="">All tiers</option>
          <option value="standard">Standard</option>
          <option value="app_trial">App · Trial</option>
          <option value="app_paid">App · Paid</option>
          <option value="app_expired">App · Expired</option>
        </select>
      </Field>
      <Field label="Trade">
        <select
          name="trade"
          defaultValue={trade}
          className="rounded-lg border border-brand-line bg-brand-bg px-3 py-2 text-sm text-brand-text"
        >
          <option value="">All trades</option>
          {TRADE_OFF_TRADES.map((t) => (
            <option key={t.slug} value={t.slug}>
              {t.label}
            </option>
          ))}
        </select>
      </Field>
      <Field label="City contains">
        <input
          type="text"
          name="city"
          defaultValue={city}
          placeholder="e.g. Manchester"
          className="rounded-lg border border-brand-line bg-brand-bg px-3 py-2 text-sm text-brand-text"
        />
      </Field>
      <button
        type="submit"
        className="rounded-full bg-brand-accent px-4 py-2 text-xs font-bold uppercase tracking-widest text-brand-bg hover:opacity-90"
      >
        Apply
      </button>
      {(tier || trade || city) && (
        <Link
          href="/admin/xrated"
          className="text-xs text-brand-muted hover:text-brand-accent"
        >
          Reset
        </Link>
      )}
    </form>
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

function Avatar({
  src,
  name
}: {
  src: string | null;
  name: string;
}) {
  const initial = (name?.[0] ?? "?").toUpperCase();
  if (!src) {
    return (
      <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-bg text-sm font-bold text-brand-muted">
        {initial}
      </span>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={name}
      className="h-9 w-9 shrink-0 rounded-full object-cover"
    />
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

