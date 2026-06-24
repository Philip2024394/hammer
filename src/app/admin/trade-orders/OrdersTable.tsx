"use client";

// Client-side trade-orders list. Sortable, status-tinted, and clicking
// a row pushes to /admin/trade-orders/[id]. We deliberately avoid the
// fetch-then-PATCH pattern at this level — actions live on the detail
// page so the owner sees the full context (line items, ship-to,
// customer notes) before flipping status.

import Link from "next/link";
import { useMemo, useState } from "react";

export type TradeOrderStatus =
  | "submitted"
  | "quoted"
  | "awaiting_payment"
  | "paid"
  | "dispatched"
  | "delivered"
  | "cancelled";

export type TradeOrderRow = {
  id: string;
  order_number: string;
  account_id: string;
  company_name: string;
  contact_email: string;
  status: TradeOrderStatus;
  freight_mode: string | null;
  incoterm: string | null;
  currency: string;
  subtotal_gbp: number;
  freight_quote_gbp: number | null;
  total_gbp: number | null;
  ship_to_country: string | null;
  tracking_ref: string | null;
  submitted_at: string | null;
  quoted_at: string | null;
  confirmed_at: string | null;
  dispatched_at: string | null;
  delivered_at: string | null;
  cancelled_at: string | null;
};

type SortKey = "submitted_at" | "company_name" | "subtotal_gbp" | "total_gbp" | "status";
type SortDir = "asc" | "desc";

export const STATUS_STYLES: Record<TradeOrderStatus, string> = {
  submitted: "border-amber-500/40 bg-amber-500/10 text-amber-300",
  quoted: "border-sky-500/40 bg-sky-500/10 text-sky-300",
  awaiting_payment: "border-fuchsia-500/40 bg-fuchsia-500/10 text-fuchsia-300",
  paid: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
  dispatched: "border-cyan-500/40 bg-cyan-500/10 text-cyan-200",
  delivered: "border-emerald-600/50 bg-emerald-600/10 text-emerald-200",
  cancelled: "border-zinc-500/40 bg-zinc-500/10 text-zinc-300"
};

export const STATUS_LABELS: Record<TradeOrderStatus, string> = {
  submitted: "Submitted",
  quoted: "Quoted",
  awaiting_payment: "Awaiting payment",
  paid: "Paid",
  dispatched: "Dispatched",
  delivered: "Delivered",
  cancelled: "Cancelled"
};

const STATUS_FILTERS: { v: TradeOrderStatus | "all"; label: string }[] = [
  { v: "all", label: "All" },
  { v: "submitted", label: "Submitted" },
  { v: "quoted", label: "Quoted" },
  { v: "awaiting_payment", label: "Awaiting payment" },
  { v: "paid", label: "Paid" },
  { v: "dispatched", label: "Dispatched" },
  { v: "delivered", label: "Delivered" },
  { v: "cancelled", label: "Cancelled" }
];

export function OrdersTable({ rows }: { rows: TradeOrderRow[] }) {
  const [sortKey, setSortKey] = useState<SortKey>("submitted_at");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [filter, setFilter] = useState<TradeOrderStatus | "all">("all");

  const counts = useMemo(() => {
    const c: Record<TradeOrderStatus | "all", number> = {
      all: rows.length,
      submitted: 0,
      quoted: 0,
      awaiting_payment: 0,
      paid: 0,
      dispatched: 0,
      delivered: 0,
      cancelled: 0
    };
    for (const r of rows) c[r.status] = (c[r.status] ?? 0) + 1;
    return c;
  }, [rows]);

  const filtered = useMemo(() => {
    if (filter === "all") return rows;
    return rows.filter((r) => r.status === filter);
  }, [rows, filter]);

  const sorted = useMemo(() => {
    const copy = [...filtered];
    copy.sort((a, b) => {
      const va = sortValue(a, sortKey);
      const vb = sortValue(b, sortKey);
      if (va === vb) return 0;
      if (va === null) return 1;
      if (vb === null) return -1;
      if (va < vb) return sortDir === "asc" ? -1 : 1;
      return sortDir === "asc" ? 1 : -1;
    });
    return copy;
  }, [filtered, sortKey, sortDir]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir(key === "company_name" ? "asc" : "desc");
    }
  }

  if (rows.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-brand-line bg-brand-surface p-6 text-center text-xs text-brand-muted">
        No trade orders yet. They appear here as soon as a buyer submits through <span className="font-mono">/trade/checkout</span>.
      </p>
    );
  }

  return (
    <section className="flex flex-col gap-3">
      <nav className="flex flex-wrap gap-1">
        {STATUS_FILTERS.map((t) => {
          const isActive = t.v === filter;
          return (
            <button
              key={t.v}
              type="button"
              onClick={() => setFilter(t.v)}
              aria-current={isActive ? "page" : undefined}
              className={`rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-widest transition ${
                isActive
                  ? "bg-brand-accent text-black"
                  : "border border-brand-line bg-brand-surface text-brand-muted hover:border-brand-accent hover:text-brand-text"
              }`}
            >
              {t.label} <span className="ml-1 text-[10px] opacity-70">({counts[t.v]})</span>
            </button>
          );
        })}
      </nav>

      <div className="overflow-hidden rounded-2xl border border-brand-line bg-brand-surface">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px]">
            <thead className="bg-black/30 text-[11px] uppercase tracking-widest text-brand-muted">
              <tr>
                <Th>Order #</Th>
                <Th sortable active={sortKey === "company_name"} dir={sortDir} onClick={() => toggleSort("company_name")}>Company</Th>
                <Th sortable active={sortKey === "submitted_at"} dir={sortDir} onClick={() => toggleSort("submitted_at")}>Submitted</Th>
                <Th>Freight</Th>
                <Th sortable active={sortKey === "subtotal_gbp"} dir={sortDir} onClick={() => toggleSort("subtotal_gbp")}>Subtotal £</Th>
                <Th sortable active={sortKey === "status"} dir={sortDir} onClick={() => toggleSort("status")}>Status</Th>
                <Th sortable active={sortKey === "total_gbp"} dir={sortDir} onClick={() => toggleSort("total_gbp")}>Total £</Th>
                <Th>Actions</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-line">
              {sorted.map((r) => (
                <tr key={r.id} className="transition hover:bg-black/20">
                  <td className="px-3 py-3 align-top font-mono text-[13px] font-bold text-brand-accent">
                    <Link href={`/admin/trade-orders/${r.id}`} className="hover:underline">{r.order_number}</Link>
                  </td>
                  <td className="px-3 py-3 align-top">
                    <div className="font-semibold text-brand-text">{r.company_name}</div>
                    <div className="text-[11px] text-brand-muted">{r.contact_email}</div>
                    {r.ship_to_country && <div className="text-[11px] text-brand-muted">→ {r.ship_to_country}</div>}
                  </td>
                  <td className="px-3 py-3 align-top text-brand-muted">{r.submitted_at ? formatDateTime(r.submitted_at) : "—"}</td>
                  <td className="px-3 py-3 align-top text-brand-text">
                    {freightLabel(r.freight_mode)}
                    {r.incoterm && <div className="text-[11px] text-brand-muted">{r.incoterm}</div>}
                  </td>
                  <td className="px-3 py-3 align-top text-brand-text">{fmtGbp(r.subtotal_gbp)}</td>
                  <td className="px-3 py-3 align-top">
                    <span className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] font-bold uppercase tracking-widest ${STATUS_STYLES[r.status]}`}>
                      {STATUS_LABELS[r.status]}
                    </span>
                  </td>
                  <td className="px-3 py-3 align-top text-brand-text">{r.total_gbp != null ? fmtGbp(r.total_gbp) : <span className="text-brand-muted">—</span>}</td>
                  <td className="px-3 py-3 align-top">
                    <Link
                      href={`/admin/trade-orders/${r.id}`}
                      className="inline-flex h-7 items-center rounded-full border border-brand-line bg-brand-bg px-3 text-[11px] font-bold uppercase tracking-widest text-brand-text transition hover:border-brand-accent hover:text-brand-accent"
                    >
                      Open
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
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

function sortValue(r: TradeOrderRow, key: SortKey): string | number | null {
  switch (key) {
    case "company_name":
      return r.company_name.toLowerCase();
    case "submitted_at":
      return r.submitted_at ? Date.parse(r.submitted_at) : null;
    case "subtotal_gbp":
      return r.subtotal_gbp ?? 0;
    case "total_gbp":
      return r.total_gbp ?? null;
    case "status":
      return r.status;
  }
}

function formatDateTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

function fmtGbp(amount: number): string {
  return new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 2 }).format(amount);
}

function freightLabel(mode: string | null): string {
  if (mode === "air") return "Air";
  if (mode === "sea") return "Sea";
  if (mode) return mode;
  return "—";
}
