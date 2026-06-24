"use client";

// Client-side trade accounts table. Sortable columns (default
// last_login_at desc), per-row status actions via PATCH, and a
// drill-down to login events via LoginHistoryModal. Sort order
// is computed locally — the server already returns the list
// sorted by last_login_at desc, but resorting on the client lets
// the owner pivot without a roundtrip.

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { LoginHistoryModal } from "./LoginHistoryModal";

export type TradeAccountStatus = "pending" | "active" | "disabled";

export type TradeAccountRow = {
  id: string;
  trade_account_no: string;
  company_name: string;
  contact_name: string | null;
  contact_email: string;
  contact_phone: string | null;
  country: string | null;
  currency: string | null;
  status: TradeAccountStatus;
  notes: string | null;
  created_at: string;
  last_login_at: string | null;
  login_count: number | null;
  total_session_seconds: number | null;
};

type SortKey = "last_login_at" | "created_at" | "company_name" | "login_count" | "total_session_seconds";
type SortDir = "asc" | "desc";

const STATUS_STYLES: Record<TradeAccountStatus, string> = {
  pending: "border-amber-500/40 bg-amber-500/10 text-amber-300",
  active: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
  disabled: "border-zinc-500/40 bg-zinc-500/10 text-zinc-300"
};

export function TradeAccountsTable({ rows }: { rows: TradeAccountRow[] }) {
  const router = useRouter();
  const [sortKey, setSortKey] = useState<SortKey>("last_login_at");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);

  const sorted = useMemo(() => {
    const copy = [...rows];
    copy.sort((a, b) => {
      const va = sortValue(a, sortKey);
      const vb = sortValue(b, sortKey);
      if (va === vb) return 0;
      // nulls always sort last regardless of dir
      if (va === null) return 1;
      if (vb === null) return -1;
      if (va < vb) return sortDir === "asc" ? -1 : 1;
      return sortDir === "asc" ? 1 : -1;
    });
    return copy;
  }, [rows, sortKey, sortDir]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir(key === "company_name" ? "asc" : "desc");
    }
  }

  async function patch(id: string, status: TradeAccountStatus) {
    setBusyId(id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/trade-accounts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      const json = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (!res.ok || !json.ok) {
        setError(json.error || `Update failed (${res.status}).`);
        setBusyId(null);
        return;
      }
      router.refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusyId(null);
    }
  }

  const openRow = useMemo(
    () => (openId ? rows.find((r) => r.id === openId) ?? null : null),
    [openId, rows]
  );

  if (rows.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-brand-line bg-brand-surface p-6 text-center text-xs text-brand-muted">
        No trade accounts yet. Create the first one above.
      </p>
    );
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-brand-line bg-brand-surface">
      {error && (
        <div className="border-b border-red-500/40 bg-red-500/10 px-4 py-2 text-xs text-red-300">{error}</div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-[13px]">
          <thead className="bg-black/30 text-[11px] uppercase tracking-widest text-brand-muted">
            <tr>
              <Th>Ref</Th>
              <Th sortable active={sortKey === "company_name"} dir={sortDir} onClick={() => toggleSort("company_name")}>
                Company
              </Th>
              <Th>Email</Th>
              <Th>Currency</Th>
              <Th>Status</Th>
              <Th sortable active={sortKey === "login_count"} dir={sortDir} onClick={() => toggleSort("login_count")}>
                Logins
              </Th>
              <Th sortable active={sortKey === "last_login_at"} dir={sortDir} onClick={() => toggleSort("last_login_at")}>
                Last login
              </Th>
              <Th sortable active={sortKey === "total_session_seconds"} dir={sortDir} onClick={() => toggleSort("total_session_seconds")}>
                Total time
              </Th>
              <Th sortable active={sortKey === "created_at"} dir={sortDir} onClick={() => toggleSort("created_at")}>
                Created
              </Th>
              <Th>Actions</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-line">
            {sorted.map((r) => (
              <tr
                key={r.id}
                onClick={() => setOpenId(r.id)}
                className="cursor-pointer transition hover:bg-black/20"
              >
                <td className="px-3 py-3 align-top font-mono text-[13px] font-bold text-brand-accent">
                  {r.trade_account_no}
                </td>
                <td className="px-3 py-3 align-top">
                  <div className="font-semibold text-brand-text">{r.company_name}</div>
                  {r.contact_name && <div className="text-[12px] text-brand-muted">{r.contact_name}</div>}
                  {r.country && <div className="text-[11px] text-brand-muted">{r.country}</div>}
                </td>
                <td className="px-3 py-3 align-top text-brand-text">
                  <a
                    href={`mailto:${r.contact_email}`}
                    onClick={(e) => e.stopPropagation()}
                    className="hover:text-brand-accent"
                  >
                    {r.contact_email}
                  </a>
                  {r.contact_phone && (
                    <div className="text-[11px] text-brand-muted">{r.contact_phone}</div>
                  )}
                </td>
                <td className="px-3 py-3 align-top text-brand-text">{r.currency ?? "—"}</td>
                <td className="px-3 py-3 align-top">
                  <span
                    className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] font-bold uppercase tracking-widest ${STATUS_STYLES[r.status]}`}
                  >
                    {r.status}
                  </span>
                </td>
                <td className="px-3 py-3 align-top text-brand-text">{r.login_count ?? 0}</td>
                <td className="px-3 py-3 align-top text-brand-muted">
                  {r.last_login_at ? formatDateTime(r.last_login_at) : "—"}
                </td>
                <td className="px-3 py-3 align-top text-brand-muted">
                  {formatDuration(r.total_session_seconds ?? 0)}
                </td>
                <td className="px-3 py-3 align-top text-brand-muted">{formatDateTime(r.created_at)}</td>
                <td className="px-3 py-3 align-top" onClick={(e) => e.stopPropagation()}>
                  <RowActions
                    status={r.status}
                    busy={busyId === r.id}
                    onActivate={() => patch(r.id, "active")}
                    onDisable={() => patch(r.id, "disabled")}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {openRow && <LoginHistoryModal account={openRow} onClose={() => setOpenId(null)} />}
    </section>
  );
}

function Th({
  children,
  sortable,
  active,
  dir,
  onClick
}: {
  children: React.ReactNode;
  sortable?: boolean;
  active?: boolean;
  dir?: SortDir;
  onClick?: () => void;
}) {
  return (
    <th
      className={`whitespace-nowrap px-3 py-2 text-left font-bold ${sortable ? "cursor-pointer select-none hover:text-brand-text" : ""}`}
      onClick={sortable ? onClick : undefined}
    >
      {children}
      {sortable && active && <span className="ml-1 text-brand-accent">{dir === "asc" ? "↑" : "↓"}</span>}
    </th>
  );
}

function RowActions({
  status,
  busy,
  onActivate,
  onDisable
}: {
  status: TradeAccountStatus;
  busy: boolean;
  onActivate: () => void;
  onDisable: () => void;
}) {
  return (
    <div className="flex flex-wrap gap-1">
      {status === "pending" && (
        <button
          type="button"
          disabled={busy}
          onClick={onActivate}
          className="h-7 rounded-full bg-brand-accent px-3 text-[11px] font-bold uppercase tracking-widest text-black transition disabled:opacity-40 hover:opacity-90"
        >
          {busy ? "…" : "Activate"}
        </button>
      )}
      {status === "active" && (
        <button
          type="button"
          disabled={busy}
          onClick={onDisable}
          className="h-7 rounded-full border border-brand-line px-3 text-[11px] font-bold uppercase tracking-widest text-brand-text transition disabled:opacity-40 hover:border-brand-accent"
        >
          {busy ? "…" : "Disable"}
        </button>
      )}
      {status === "disabled" && (
        <button
          type="button"
          disabled={busy}
          onClick={onActivate}
          className="h-7 rounded-full bg-brand-accent px-3 text-[11px] font-bold uppercase tracking-widest text-black transition disabled:opacity-40 hover:opacity-90"
        >
          {busy ? "…" : "Re-enable"}
        </button>
      )}
    </div>
  );
}

function sortValue(r: TradeAccountRow, key: SortKey): string | number | null {
  switch (key) {
    case "company_name":
      return r.company_name.toLowerCase();
    case "created_at":
      return Date.parse(r.created_at);
    case "last_login_at":
      return r.last_login_at ? Date.parse(r.last_login_at) : null;
    case "login_count":
      return r.login_count ?? 0;
    case "total_session_seconds":
      return r.total_session_seconds ?? 0;
  }
}

function formatDateTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

export function formatDuration(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  if (s === 0) return "—";
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m`;
  return `${sec}s`;
}
