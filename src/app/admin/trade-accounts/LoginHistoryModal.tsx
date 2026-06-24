"use client";

// Drill-down modal showing the last 50 login events for a single
// trade account. Lazy-fetches /api/admin/trade-accounts/[id]/logins
// when opened. Closes on backdrop click and the Escape key.

import { useEffect, useState } from "react";
import { formatDuration, type TradeAccountRow } from "./TradeAccountsTable";

type LoginEvent = {
  id: string;
  signed_in_at: string;
  signed_out_at: string | null;
  session_duration_seconds: number | null;
  ip: string | null;
  user_agent: string | null;
  country_inferred: string | null;
};

type ApiResponse = { ok: boolean; events?: LoginEvent[]; error?: string };

export function LoginHistoryModal({ account, onClose }: { account: TradeAccountRow; onClose: () => void }) {
  const [events, setEvents] = useState<LoginEvent[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetch(`/api/admin/trade-accounts/${account.id}/logins`)
      .then(async (res) => {
        const json = (await res.json().catch(() => ({}))) as ApiResponse;
        if (cancelled) return;
        if (!res.ok || !json.ok) {
          setError(json.error || `Failed to load events (${res.status}).`);
          setEvents([]);
        } else {
          setEvents(json.events ?? []);
        }
      })
      .catch((e: unknown) => {
        if (!cancelled) {
          setError((e as Error).message);
          setEvents([]);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [account.id]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Login history for ${account.trade_account_no}`}
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 p-4 sm:items-center"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-2xl border border-brand-line bg-brand-surface text-[13px] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex flex-wrap items-start justify-between gap-3 border-b border-brand-line px-5 py-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-[13px]">
              <span className="font-mono font-bold text-brand-accent">{account.trade_account_no}</span>
              <span className="text-brand-muted">·</span>
              <span className="font-semibold text-brand-text">{account.company_name}</span>
            </div>
            <div className="mt-1 text-[12px] text-brand-muted">{account.contact_email}</div>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[12px] text-brand-muted">
              <span>Logins: <span className="text-brand-text">{account.login_count ?? 0}</span></span>
              <span>Total time: <span className="text-brand-text">{formatDuration(account.total_session_seconds ?? 0)}</span></span>
              <span>
                Last login:{" "}
                <span className="text-brand-text">
                  {account.last_login_at ? new Date(account.last_login_at).toLocaleString() : "—"}
                </span>
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="h-9 rounded-full border border-brand-line px-3 text-[11px] font-bold uppercase tracking-widest text-brand-muted transition hover:border-brand-accent hover:text-brand-text"
          >
            Close
          </button>
        </header>

        <div className="max-h-[60vh] overflow-y-auto">
          {loading && (
            <p className="px-5 py-8 text-center text-[12px] text-brand-muted">Loading login history…</p>
          )}
          {!loading && error && (
            <p className="m-5 rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-[12px] text-red-300">{error}</p>
          )}
          {!loading && !error && events && events.length === 0 && (
            <p className="px-5 py-8 text-center text-[12px] text-brand-muted">
              No login events yet for this account.
            </p>
          )}
          {!loading && !error && events && events.length > 0 && (
            <table className="w-full text-left text-[13px]">
              <thead className="sticky top-0 bg-black/40 text-[11px] uppercase tracking-widest text-brand-muted">
                <tr>
                  <th className="px-4 py-2 font-bold">Signed in</th>
                  <th className="px-4 py-2 font-bold">Duration</th>
                  <th className="px-4 py-2 font-bold">IP</th>
                  <th className="px-4 py-2 font-bold">User agent</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-line">
                {events.map((ev) => (
                  <tr key={ev.id}>
                    <td className="px-4 py-2 align-top text-brand-text">
                      {new Date(ev.signed_in_at).toLocaleString()}
                      {ev.country_inferred && (
                        <span className="ml-1 text-[11px] text-brand-muted">({ev.country_inferred})</span>
                      )}
                    </td>
                    <td className="px-4 py-2 align-top text-brand-muted">
                      {formatDuration(ev.session_duration_seconds ?? 0)}
                    </td>
                    <td className="px-4 py-2 align-top font-mono text-[12px] text-brand-muted">
                      {ev.ip ?? "—"}
                    </td>
                    <td className="px-4 py-2 align-top text-[12px] text-brand-muted">
                      <span className="block max-w-[280px] truncate" title={ev.user_agent ?? ""}>
                        {ev.user_agent ?? "—"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
