// Admin trade-orders dashboard. Lists every submitted trade order with
// the status pill, subtotal, and total once a freight quote is entered.
// Click-through to /admin/trade-orders/[id] for status actions + email
// resend.
//
// Server component fetches the row+account-join (manual stitch — we
// don't rely on Postgres-level foreign-key embedding because the admin
// service-role client doesn't carry an FK alias for the join). Sorting
// + filtering live in the client component.

import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { OrdersTable, type TradeOrderRow } from "./OrdersTable";

export const dynamic = "force-dynamic";

export default async function AdminTradeOrdersPage() {
  const ordersRes = await supabaseAdmin
    .from("hammerex_trade_orders")
    .select(
      "id, order_number, account_id, status, freight_mode, incoterm, currency, subtotal_gbp, freight_quote_gbp, total_gbp, ship_to_country, tracking_ref, submitted_at, quoted_at, confirmed_at, dispatched_at, delivered_at, cancelled_at"
    )
    .order("submitted_at", { ascending: false, nullsFirst: false })
    .limit(500);

  const orders = (ordersRes.data ?? []) as Omit<TradeOrderRow, "company_name" | "contact_email">[];

  // One follow-up roundtrip to fetch the joined company/email so the
  // table can render without a per-row request. We deduplicate the
  // account ids first.
  const accountIds = Array.from(new Set(orders.map((o) => o.account_id))).filter(Boolean);
  let accountMap = new Map<string, { company_name: string; contact_email: string }>();
  if (accountIds.length > 0) {
    const accRes = await supabaseAdmin
      .from("hammerex_trade_accounts")
      .select("id, company_name, contact_email")
      .in("id", accountIds);
    for (const a of (accRes.data ?? []) as { id: string; company_name: string; contact_email: string }[]) {
      accountMap.set(a.id, { company_name: a.company_name, contact_email: a.contact_email });
    }
  }

  const rows: TradeOrderRow[] = orders.map((o) => ({
    ...o,
    company_name: accountMap.get(o.account_id)?.company_name ?? "—",
    contact_email: accountMap.get(o.account_id)?.contact_email ?? "—"
  }));

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-baseline justify-between gap-3">
        <h1 className="text-xl font-bold">Trade Orders</h1>
        <p className="text-xs text-brand-muted">
          Buyers submit through <span className="font-mono">/trade/checkout</span>. Hammerex replies within 24h with a freight quote, then transitions the order through paid → dispatched → delivered.
        </p>
      </header>

      {ordersRes.error && (
        <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-xs text-red-300">
          Failed to load trade orders: {ordersRes.error.message}
        </div>
      )}

      <OrdersTable rows={rows} />
    </div>
  );
}
