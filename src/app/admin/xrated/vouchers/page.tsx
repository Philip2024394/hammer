// Xrated Trades — Welcome Knife voucher console.
// Lists every voucher (across all listings) with status, expiry, the
// owning tradie, and the order ref it was redeemed against. Per-row
// inline forms POST to /api/admin/xrated/vouchers/redeem so the page
// works with no client JS.

import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import type {
  HammerexTradeOffListing,
  HammerexXratedVoucher
} from "@/lib/supabase";

export const dynamic = "force-dynamic";

type ListingLite = Pick<
  HammerexTradeOffListing,
  "id" | "slug" | "display_name" | "city"
>;

type Row = HammerexXratedVoucher & { listing: ListingLite | null };

export default async function AdminXratedVouchersPage() {
  const res = await supabaseAdmin
    .from("hammerex_xrated_vouchers")
    .select(
      "id, listing_id, code, product_slug, status, issued_at, expires_at, redeemed_at, redeemed_order_ref, admin_note"
    )
    .order("issued_at", { ascending: false })
    .limit(1000);

  const vouchers = (res.data ?? []) as HammerexXratedVoucher[];
  const listingIds = Array.from(new Set(vouchers.map((v) => v.listing_id)));

  let listingMap = new Map<string, ListingLite>();
  if (listingIds.length > 0) {
    const lres = await supabaseAdmin
      .from("hammerex_trade_off_listings")
      .select("id, slug, display_name, city")
      .in("id", listingIds);
    listingMap = new Map(
      (lres.data ?? []).map((l) => [
        l.id as string,
        l as ListingLite
      ])
    );
  }

  const rows: Row[] = vouchers.map((v) => ({
    ...v,
    listing: listingMap.get(v.listing_id) ?? null
  }));

  const counts = {
    total: rows.length,
    unused: rows.filter((r) => r.status === "unused").length,
    redeemed: rows.filter((r) => r.status === "redeemed").length,
    expired: rows.filter((r) => r.status === "expired").length,
    revoked: rows.filter((r) => r.status === "revoked").length
  };

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-baseline justify-between gap-3">
        <h1 className="text-xl font-bold">Welcome Knife vouchers</h1>
        <p className="text-xs text-brand-muted">
          Every Xrated Trades signup that goes live gets a unique voucher
          redeemable for a FREE Hammerex Folding Safety Cutting Knife on a
          future order. Flip to &ldquo;Redeemed&rdquo; when you actually
          fulfil the order.
        </p>
      </header>

      {res.error && (
        <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-xs text-red-300">
          Failed to load vouchers: {res.error.message}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        <Kpi label="Total" value={counts.total} />
        <Kpi label="Unused" value={counts.unused} accent="yellow" />
        <Kpi label="Redeemed" value={counts.redeemed} accent="emerald" />
        <Kpi label="Expired" value={counts.expired} />
        <Kpi label="Revoked" value={counts.revoked} accent="red" />
      </div>

      {rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-brand-line p-8 text-center text-sm text-brand-muted">
          No vouchers yet. The next Xrated Trades signup will seed one.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-brand-line bg-brand-surface">
          <table className="min-w-full divide-y divide-brand-line text-sm">
            <thead className="bg-brand-bg text-xs uppercase tracking-widest text-brand-muted">
              <tr>
                <Th>Code</Th>
                <Th>Tradie</Th>
                <Th>Status</Th>
                <Th>Issued</Th>
                <Th>Expires</Th>
                <Th>Redeemed on</Th>
                <Th>Order ref</Th>
                <Th>Admin note</Th>
                <Th className="text-right">Actions</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-line">
              {rows.map((r) => (
                <tr key={r.id} className="align-top hover:bg-brand-bg/40">
                  <Td className="font-mono text-xs font-bold text-brand-accent">
                    {r.code}
                  </Td>
                  <Td>
                    {r.listing ? (
                      <div className="min-w-0">
                        <Link
                          href={`/admin/xrated/${r.listing.slug}`}
                          className="block truncate font-semibold text-brand-text hover:text-brand-accent"
                        >
                          {r.listing.display_name}
                        </Link>
                        <div className="truncate text-xs text-brand-muted">
                          {r.listing.city}
                        </div>
                      </div>
                    ) : (
                      <span className="text-xs text-brand-muted">
                        (listing missing)
                      </span>
                    )}
                  </Td>
                  <Td>
                    <StatusPill status={r.status} />
                  </Td>
                  <Td className="text-xs text-brand-muted">
                    {shortDate(r.issued_at)}
                  </Td>
                  <Td className="text-xs text-brand-muted">
                    {shortDate(r.expires_at)}
                  </Td>
                  <Td className="text-xs text-brand-muted">
                    {r.redeemed_at ? shortDate(r.redeemed_at) : "—"}
                  </Td>
                  <Td className="text-xs text-brand-muted">
                    {r.redeemed_order_ref ?? "—"}
                  </Td>
                  <Td className="max-w-xs whitespace-pre-wrap text-xs text-brand-muted">
                    {r.admin_note ?? "—"}
                  </Td>
                  <Td>
                    <RowActions
                      id={r.id}
                      status={r.status}
                      orderRef={r.redeemed_order_ref}
                      adminNote={r.admin_note}
                    />
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function RowActions({
  id,
  status,
  orderRef,
  adminNote
}: {
  id: string;
  status: HammerexXratedVoucher["status"];
  orderRef: string | null;
  adminNote: string | null;
}) {
  return (
    <div className="flex flex-col items-stretch gap-2 lg:min-w-[240px]">
      {status !== "redeemed" && (
        <details className="rounded-lg border border-emerald-500/40 bg-emerald-500/5 p-2">
          <summary className="cursor-pointer text-xs font-bold uppercase tracking-widest text-emerald-300">
            Mark redeemed
          </summary>
          <form
            action="/api/admin/xrated/vouchers/redeem"
            method="post"
            className="mt-2 flex flex-col gap-2"
          >
            <input type="hidden" name="id" value={id} />
            <input type="hidden" name="status" value="redeemed" />
            <input
              type="text"
              name="order_ref"
              defaultValue={orderRef ?? ""}
              placeholder="Order ref e.g. Q-AB12CD"
              className="rounded-md border border-brand-line bg-brand-bg px-2 py-1 text-xs text-brand-text"
            />
            <input
              type="text"
              name="admin_note"
              defaultValue={adminNote ?? ""}
              placeholder="Optional note"
              className="rounded-md border border-brand-line bg-brand-bg px-2 py-1 text-xs text-brand-text"
            />
            <button
              type="submit"
              className="rounded-full bg-emerald-500 px-3 py-1.5 text-xs font-bold uppercase tracking-widest text-brand-bg hover:opacity-90"
            >
              Confirm redeem
            </button>
          </form>
        </details>
      )}
      {status !== "unused" && (
        <form
          action="/api/admin/xrated/vouchers/redeem"
          method="post"
          className="inline-flex"
        >
          <input type="hidden" name="id" value={id} />
          <input type="hidden" name="status" value="unused" />
          <button
            type="submit"
            className="w-full rounded-full border border-brand-line bg-brand-surface px-3 py-1.5 text-xs font-bold uppercase tracking-widest text-brand-text hover:border-brand-accent hover:text-brand-accent"
          >
            Reset to unused
          </button>
        </form>
      )}
      {status !== "revoked" && (
        <form
          action="/api/admin/xrated/vouchers/redeem"
          method="post"
          className="inline-flex"
        >
          <input type="hidden" name="id" value={id} />
          <input type="hidden" name="status" value="revoked" />
          <button
            type="submit"
            className="w-full rounded-full border border-red-500/50 bg-red-500/10 px-3 py-1.5 text-xs font-bold uppercase tracking-widest text-red-300 hover:bg-red-500/20"
          >
            Revoke
          </button>
        </form>
      )}
    </div>
  );
}

function StatusPill({ status }: { status: HammerexXratedVoucher["status"] }) {
  const cls: Record<HammerexXratedVoucher["status"], string> = {
    unused: "border-[#FFB300] bg-[#FFB300]/15 text-[#FFB300]",
    redeemed: "border-emerald-500/50 bg-emerald-500/10 text-emerald-300",
    expired: "border-brand-line bg-brand-bg text-brand-muted",
    revoked: "border-red-500/50 bg-red-500/10 text-red-300"
  };
  const label: Record<HammerexXratedVoucher["status"], string> = {
    unused: "Unused",
    redeemed: "Redeemed",
    expired: "Expired",
    revoked: "Revoked"
  };
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold uppercase tracking-widest ${cls[status]}`}
    >
      {label[status]}
    </span>
  );
}

function Kpi({
  label,
  value,
  accent
}: {
  label: string;
  value: number;
  accent?: "emerald" | "yellow" | "red";
}) {
  const cls =
    accent === "emerald"
      ? "text-emerald-300"
      : accent === "yellow"
        ? "text-[#FFB300]"
        : accent === "red"
          ? "text-red-300"
          : "text-brand-text";
  return (
    <div className="rounded-2xl border border-brand-line bg-brand-surface p-4">
      <div className="text-xs font-semibold uppercase tracking-widest text-brand-muted">
        {label}
      </div>
      <div className={`mt-1 text-2xl font-bold tabular-nums ${cls}`}>
        {value}
      </div>
    </div>
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
    <td className={`px-3 py-3 align-top ${className}`}>{children}</td>
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
