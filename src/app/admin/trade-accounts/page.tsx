// Admin trade-accounts dashboard. Lets the owner provision new trade
// accounts (HMX-T-NNNN) and monitor login activity. Server component
// fetches the list; client components handle the form, table actions
// and per-row drill-down. Magic-link send is wired elsewhere (Agent C)
// — this page only writes the row with status='pending'.

import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { NewAccountForm } from "./NewAccountForm";
import { TradeAccountsTable, type TradeAccountRow } from "./TradeAccountsTable";

export const dynamic = "force-dynamic";

export default async function AdminTradeAccountsPage() {
  const { data, error } = await supabaseAdmin
    .from("hammerex_trade_accounts")
    .select(
      "id, trade_account_no, company_name, contact_name, contact_email, contact_phone, country, currency, status, notes, created_at, last_login_at, login_count, total_session_seconds"
    )
    .order("last_login_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false })
    .limit(500);

  const rows = (data ?? []) as TradeAccountRow[];

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-baseline justify-between gap-3">
        <h1 className="text-xl font-bold">Trade Accounts</h1>
        <p className="text-xs text-brand-muted">
          Provision and monitor B2B accounts. New rows land as
          <span className="mx-1 rounded bg-brand-bg px-1.5 py-0.5 font-mono text-[11px] text-brand-accent">pending</span>
          until you activate them. Magic-link delivery is handled by the auth
          service &mdash; this page only manages the directory.
        </p>
      </header>

      {error && (
        <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-xs text-red-300">
          Failed to load trade accounts: {error.message}
        </div>
      )}

      <NewAccountForm />

      <TradeAccountsTable rows={rows} />
    </div>
  );
}
