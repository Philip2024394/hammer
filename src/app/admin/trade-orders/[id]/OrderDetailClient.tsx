"use client";

// Order detail client. Renders the full order context (line items,
// ship-to, customer notes, email log) and shows one status-specific
// action card at the bottom. Every action POSTs to PATCH
// /api/admin/trade-orders/[id] which handles the DB update, the
// timestamp, AND the email trigger server-side.
//
// We keep the UI honest about the lifecycle: the timeline is rendered
// in the same order PATCH enforces (submitted → quoted →
// awaiting_payment → paid → dispatched → delivered, with cancel
// reachable from any non-terminal state).

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { STATUS_LABELS, STATUS_STYLES, type TradeOrderStatus } from "../OrdersTable";

export type OrderDetail = {
  id: string;
  order_number: string;
  account_id: string;
  status: TradeOrderStatus;
  freight_mode: string | null;
  incoterm: string | null;
  currency: string;
  subtotal_gbp: number;
  goods_idr_locked: number | null;
  freight_quote_gbp: number | null;
  freight_quote_idr: number | null;
  total_gbp: number | null;
  ship_to_country: string | null;
  ship_to_address: string | null;
  customer_notes: string | null;
  admin_notes: string | null;
  tracking_ref: string | null;
  submitted_at: string | null;
  quoted_at: string | null;
  confirmed_at: string | null;
  dispatched_at: string | null;
  delivered_at: string | null;
  cancelled_at: string | null;
};

export type OrderItem = {
  id: string;
  product_name_snapshot: string | null;
  sku_snapshot: string | null;
  size: string | null;
  thread_color: string | null;
  qty: number;
  unit_price_gbp: number;
  line_total_gbp: number;
};

export type TradeAccountLite = {
  id: string;
  trade_account_no: string;
  company_name: string;
  contact_name: string | null;
  contact_email: string;
  contact_phone: string | null;
  country: string | null;
  currency: string;
};

export type EmailLogEntry = {
  id: string;
  recipient_email: string;
  email_type: string;
  resend_message_id: string | null;
  sent_at: string;
  error: string | null;
};

const TIMELINE: { key: TradeOrderStatus; label: string; getAt: (o: OrderDetail) => string | null }[] = [
  { key: "submitted", label: "Submitted", getAt: (o) => o.submitted_at },
  { key: "quoted", label: "Quoted", getAt: (o) => o.quoted_at },
  { key: "awaiting_payment", label: "Awaiting payment", getAt: (o) => o.confirmed_at },
  { key: "paid", label: "Paid", getAt: (o) => o.confirmed_at },
  { key: "dispatched", label: "Dispatched", getAt: (o) => o.dispatched_at },
  { key: "delivered", label: "Delivered", getAt: (o) => o.delivered_at }
];

export function OrderDetailClient({
  order,
  items,
  account,
  emailLog
}: {
  order: OrderDetail;
  items: OrderItem[];
  account: TradeAccountLite | null;
  emailLog: EmailLogEntry[];
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [banner, setBanner] = useState<{ kind: "ok" | "error"; msg: string } | null>(null);

  async function patch(payload: Record<string, unknown>) {
    setBusy(true);
    setBanner(null);
    try {
      const res = await fetch(`/api/admin/trade-orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const json = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string; emailWarning?: string };
      if (!res.ok || !json.ok) {
        setBanner({ kind: "error", msg: json.error || `Update failed (${res.status}).` });
      } else if (json.emailWarning) {
        setBanner({ kind: "error", msg: `Saved, but email failed: ${json.emailWarning}` });
        router.refresh();
      } else {
        setBanner({ kind: "ok", msg: "Updated." });
        router.refresh();
      }
    } catch (e) {
      setBanner({ kind: "error", msg: (e as Error).message });
    } finally {
      setBusy(false);
    }
  }

  async function resendEmails() {
    setBusy(true);
    setBanner(null);
    try {
      const res = await fetch(`/api/admin/trade-orders/${order.id}/resend-emails`, {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
      const json = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (!res.ok || !json.ok) {
        setBanner({ kind: "error", msg: json.error || `Resend failed (${res.status}).` });
      } else {
        setBanner({ kind: "ok", msg: "Re-sent." });
        router.refresh();
      }
    } catch (e) {
      setBanner({ kind: "error", msg: (e as Error).message });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr,360px]">
      <div className="flex flex-col gap-5">
        {banner && (
          <div
            className={`rounded-xl border px-3 py-2 text-xs ${
              banner.kind === "ok"
                ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
                : "border-red-500/40 bg-red-500/10 text-red-300"
            }`}
          >
            {banner.msg}
          </div>
        )}

        <HeaderSummary order={order} account={account} />

        <ItemsCard items={items} />

        {order.customer_notes && (
          <BlockCard label="Customer notes">{order.customer_notes}</BlockCard>
        )}

        {order.admin_notes && (
          <BlockCard label="Internal note">{order.admin_notes}</BlockCard>
        )}

        <EmailLogCard log={emailLog} onResend={resendEmails} busy={busy} />
      </div>

      <aside className="flex flex-col gap-4">
        <TimelineCard order={order} />
        <ActionCard order={order} onPatch={patch} busy={busy} />
      </aside>
    </div>
  );
}

// ----- Sub-components --------------------------------------------------

function HeaderSummary({ order, account }: { order: OrderDetail; account: TradeAccountLite | null }) {
  return (
    <section className="rounded-2xl border border-brand-line bg-brand-surface p-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <Label>Status</Label>
          <span className={`mt-1 inline-flex rounded-full border px-2 py-0.5 text-[11px] font-bold uppercase tracking-widest ${STATUS_STYLES[order.status]}`}>
            {STATUS_LABELS[order.status]}
          </span>
        </div>
        <div>
          <Label>Submitted</Label>
          <div className="text-sm">{order.submitted_at ? new Date(order.submitted_at).toLocaleString() : "—"}</div>
        </div>
        <div>
          <Label>Buyer</Label>
          <div className="text-sm font-semibold">{account?.company_name ?? "—"}</div>
          <div className="text-[11px] text-brand-muted font-mono">{account?.trade_account_no ?? ""}</div>
          {account?.contact_name && <div className="text-[12px] text-brand-muted">{account.contact_name}</div>}
        </div>
        <div>
          <Label>Contact</Label>
          {account?.contact_email && (
            <a className="text-sm hover:text-brand-accent" href={`mailto:${account.contact_email}`}>{account.contact_email}</a>
          )}
          {account?.contact_phone && <div className="text-[12px] text-brand-muted">{account.contact_phone}</div>}
          {account?.country && <div className="text-[11px] text-brand-muted">{account.country}</div>}
        </div>
        <div>
          <Label>Freight</Label>
          <div className="text-sm">{freightLabel(order.freight_mode)}</div>
          {order.incoterm && <div className="text-[11px] text-brand-muted">{order.incoterm}</div>}
        </div>
        <div>
          <Label>Ship to</Label>
          <div className="text-sm">{order.ship_to_country ?? "—"}</div>
          {order.ship_to_address && (
            <div className="mt-1 whitespace-pre-line rounded-lg border border-brand-line bg-black/30 p-2 text-[12px] text-brand-text">
              {order.ship_to_address}
            </div>
          )}
        </div>
        <div>
          <Label>Subtotal</Label>
          <div className="text-sm font-semibold">{fmtGbp(order.subtotal_gbp)}</div>
        </div>
        <div>
          <Label>Total</Label>
          <div className="text-sm font-semibold text-brand-accent">{order.total_gbp != null ? fmtGbp(order.total_gbp) : "—"}</div>
          {order.freight_quote_gbp != null && (
            <div className="text-[11px] text-brand-muted">freight {fmtGbp(order.freight_quote_gbp)}</div>
          )}
        </div>
        {order.tracking_ref && (
          <div className="sm:col-span-2">
            <Label>Tracking reference</Label>
            <div className="text-sm font-mono">{order.tracking_ref}</div>
          </div>
        )}
      </div>
    </section>
  );
}

function ItemsCard({ items }: { items: OrderItem[] }) {
  return (
    <section className="rounded-2xl border border-brand-line bg-brand-surface">
      <div className="border-b border-brand-line px-4 py-2 text-[11px] font-bold uppercase tracking-widest text-brand-muted">
        Line items ({items.length})
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-[13px]">
          <thead className="bg-black/30 text-[11px] uppercase tracking-widest text-brand-muted">
            <tr>
              <th className="px-3 py-2 text-left font-bold">Ref</th>
              <th className="px-3 py-2 text-left font-bold">Product</th>
              <th className="px-3 py-2 text-left font-bold">Variant</th>
              <th className="px-3 py-2 text-right font-bold">Qty</th>
              <th className="px-3 py-2 text-right font-bold">Unit £</th>
              <th className="px-3 py-2 text-right font-bold">Line total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-line">
            {items.length === 0 && (
              <tr>
                <td colSpan={6} className="px-3 py-4 text-center text-xs text-brand-muted">No line items.</td>
              </tr>
            )}
            {items.map((it) => {
              const variant = [it.size && `Size ${it.size}`, it.thread_color && `Thread ${it.thread_color}`].filter(Boolean).join(" · ") || "—";
              return (
                <tr key={it.id}>
                  <td className="px-3 py-2 align-top font-mono text-[12px] text-brand-accent">{it.sku_snapshot || "—"}</td>
                  <td className="px-3 py-2 align-top">{it.product_name_snapshot || "—"}</td>
                  <td className="px-3 py-2 align-top text-brand-muted">{variant}</td>
                  <td className="px-3 py-2 align-top text-right">{it.qty}</td>
                  <td className="px-3 py-2 align-top text-right">{fmtGbp(it.unit_price_gbp)}</td>
                  <td className="px-3 py-2 align-top text-right">{fmtGbp(it.line_total_gbp)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function BlockCard({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-brand-line bg-brand-surface p-4">
      <Label>{label}</Label>
      <div className="mt-2 whitespace-pre-line text-[13px] text-brand-text">{children}</div>
    </section>
  );
}

function EmailLogCard({ log, onResend, busy }: { log: EmailLogEntry[]; onResend: () => void; busy: boolean }) {
  return (
    <section className="rounded-2xl border border-brand-line bg-brand-surface">
      <div className="flex items-center justify-between border-b border-brand-line px-4 py-2">
        <div className="text-[11px] font-bold uppercase tracking-widest text-brand-muted">
          Email log ({log.length})
        </div>
        <button
          type="button"
          onClick={onResend}
          disabled={busy}
          className="rounded-full border border-brand-line bg-brand-bg px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-brand-text transition hover:border-brand-accent hover:text-brand-accent disabled:opacity-40"
        >
          {busy ? "…" : "Resend email"}
        </button>
      </div>
      {log.length === 0 ? (
        <div className="px-4 py-3 text-xs text-brand-muted">No emails sent for this order yet.</div>
      ) : (
        <ul className="divide-y divide-brand-line">
          {log.map((e) => (
            <li key={e.id} className="px-4 py-2 text-[12px]">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <span className="font-mono text-[11px] uppercase tracking-widest text-brand-accent">{e.email_type}</span>
                <span className="text-[11px] text-brand-muted">{new Date(e.sent_at).toLocaleString()}</span>
              </div>
              <div className="text-brand-text">{e.recipient_email}</div>
              {e.resend_message_id && <div className="text-[11px] text-brand-muted font-mono">id: {e.resend_message_id}</div>}
              {e.error && <div className="text-[11px] text-red-300">error: {e.error}</div>}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function TimelineCard({ order }: { order: OrderDetail }) {
  const currentIdx = useMemo(() => {
    const idx = TIMELINE.findIndex((s) => s.key === order.status);
    return idx === -1 ? -1 : idx;
  }, [order.status]);

  return (
    <section className="rounded-2xl border border-brand-line bg-brand-surface p-4">
      <Label>Timeline</Label>
      <ol className="mt-3 space-y-2">
        {TIMELINE.map((s, i) => {
          const at = s.getAt(order);
          const active = i <= currentIdx && order.status !== "cancelled";
          return (
            <li key={s.key} className="flex items-start gap-2 text-[12px]">
              <span
                className={`mt-0.5 inline-block h-2.5 w-2.5 shrink-0 rounded-full ${active ? "bg-brand-accent" : "bg-brand-line"}`}
              />
              <div className="min-w-0 flex-1">
                <div className={active ? "text-brand-text" : "text-brand-muted"}>{s.label}</div>
                {at && <div className="text-[11px] text-brand-muted">{new Date(at).toLocaleString()}</div>}
              </div>
            </li>
          );
        })}
        {order.status === "cancelled" && (
          <li className="flex items-start gap-2 text-[12px]">
            <span className="mt-0.5 inline-block h-2.5 w-2.5 shrink-0 rounded-full bg-red-400" />
            <div>
              <div className="text-red-300">Cancelled</div>
              {order.cancelled_at && <div className="text-[11px] text-brand-muted">{new Date(order.cancelled_at).toLocaleString()}</div>}
            </div>
          </li>
        )}
      </ol>
    </section>
  );
}

function ActionCard({
  order,
  onPatch,
  busy
}: {
  order: OrderDetail;
  onPatch: (payload: Record<string, unknown>) => void;
  busy: boolean;
}) {
  const [freightInput, setFreightInput] = useState<string>(order.freight_quote_gbp != null ? String(order.freight_quote_gbp) : "");
  const [adminNotes, setAdminNotes] = useState<string>(order.admin_notes ?? "");
  const [tracking, setTracking] = useState<string>(order.tracking_ref ?? "");

  return (
    <section className="rounded-2xl border border-brand-accent/40 bg-brand-surface p-4">
      <Label>Next action</Label>

      {order.status === "submitted" && (
        <form
          className="mt-3 flex flex-col gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            const freight = parseFloat(freightInput);
            if (!Number.isFinite(freight) || freight < 0) return;
            onPatch({ status: "quoted", freight_quote_gbp: freight, admin_notes: adminNotes || null });
          }}
        >
          <div className="text-[12px] text-brand-muted">
            Enter the final freight cost in GBP. Submitting fires the &ldquo;quote ready&rdquo; email to the buyer.
          </div>
          <label className="flex flex-col gap-1 text-[11px] uppercase tracking-widest text-brand-muted">
            Freight quote (£)
            <input
              type="number"
              step="0.01"
              min="0"
              required
              value={freightInput}
              onChange={(e) => setFreightInput(e.target.value)}
              className="h-10 rounded-lg border border-brand-line bg-brand-bg px-3 text-sm text-brand-text outline-none focus:border-brand-accent"
            />
          </label>
          <label className="flex flex-col gap-1 text-[11px] uppercase tracking-widest text-brand-muted">
            Internal/customer note (optional)
            <textarea
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              rows={3}
              className="rounded-lg border border-brand-line bg-brand-bg p-2 text-sm text-brand-text outline-none focus:border-brand-accent"
              placeholder="Surfaced in the quote email."
            />
          </label>
          <button
            type="submit"
            disabled={busy}
            className="h-10 rounded-full bg-brand-accent px-4 text-xs font-bold uppercase tracking-widest text-black transition disabled:opacity-40 hover:opacity-90"
          >
            {busy ? "…" : "Send quote → mark quoted"}
          </button>
        </form>
      )}

      {order.status === "quoted" && (
        <div className="mt-3 flex flex-col gap-2">
          <div className="text-[12px] text-brand-muted">
            Buyer has been emailed the quote. When they reply &ldquo;accept&rdquo;, advance to <strong>awaiting payment</strong>. No email is sent.
          </div>
          <button
            type="button"
            disabled={busy}
            onClick={() => onPatch({ status: "awaiting_payment" })}
            className="h-10 rounded-full bg-brand-accent px-4 text-xs font-bold uppercase tracking-widest text-black transition disabled:opacity-40 hover:opacity-90"
          >
            {busy ? "…" : "Mark awaiting payment"}
          </button>
        </div>
      )}

      {order.status === "awaiting_payment" && (
        <div className="mt-3 flex flex-col gap-2">
          <div className="text-[12px] text-brand-muted">
            Once the bank transfer arrives, mark as paid. No email is sent (the buyer already knows).
          </div>
          <button
            type="button"
            disabled={busy}
            onClick={() => onPatch({ status: "paid" })}
            className="h-10 rounded-full bg-brand-accent px-4 text-xs font-bold uppercase tracking-widest text-black transition disabled:opacity-40 hover:opacity-90"
          >
            {busy ? "…" : "Mark paid"}
          </button>
        </div>
      )}

      {order.status === "paid" && (
        <form
          className="mt-3 flex flex-col gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            if (!tracking.trim()) return;
            onPatch({ status: "dispatched", tracking_ref: tracking.trim() });
          }}
        >
          <div className="text-[12px] text-brand-muted">
            Enter the carrier tracking reference. Submitting fires the dispatched email with ETA.
          </div>
          <label className="flex flex-col gap-1 text-[11px] uppercase tracking-widest text-brand-muted">
            Tracking ref
            <input
              type="text"
              required
              value={tracking}
              onChange={(e) => setTracking(e.target.value)}
              className="h-10 rounded-lg border border-brand-line bg-brand-bg px-3 text-sm text-brand-text outline-none focus:border-brand-accent"
              placeholder="e.g. DHL 1234567890"
            />
          </label>
          <button
            type="submit"
            disabled={busy}
            className="h-10 rounded-full bg-brand-accent px-4 text-xs font-bold uppercase tracking-widest text-black transition disabled:opacity-40 hover:opacity-90"
          >
            {busy ? "…" : "Send dispatch email → mark dispatched"}
          </button>
        </form>
      )}

      {order.status === "dispatched" && (
        <div className="mt-3 flex flex-col gap-2">
          <div className="text-[12px] text-brand-muted">
            Once the buyer confirms receipt, mark as delivered. No email is sent.
          </div>
          <button
            type="button"
            disabled={busy}
            onClick={() => onPatch({ status: "delivered" })}
            className="h-10 rounded-full bg-brand-accent px-4 text-xs font-bold uppercase tracking-widest text-black transition disabled:opacity-40 hover:opacity-90"
          >
            {busy ? "…" : "Mark delivered"}
          </button>
        </div>
      )}

      {order.status === "delivered" && (
        <div className="mt-3 text-[12px] text-brand-muted">Order complete. Nothing left to do here.</div>
      )}

      {order.status === "cancelled" && (
        <div className="mt-3 text-[12px] text-brand-muted">Cancelled — no further actions.</div>
      )}

      {order.status !== "cancelled" && order.status !== "delivered" && (
        <button
          type="button"
          disabled={busy}
          onClick={() => {
            if (typeof window !== "undefined" && window.confirm("Cancel this order? This cannot be undone from the UI.")) {
              onPatch({ status: "cancelled" });
            }
          }}
          className="mt-4 h-9 rounded-full border border-red-500/40 bg-red-500/10 px-3 text-[11px] font-bold uppercase tracking-widest text-red-300 transition hover:bg-red-500/20 disabled:opacity-40"
        >
          {busy ? "…" : "Cancel order"}
        </button>
      )}
    </section>
  );
}

// ----- atoms ----------------------------------------------------------

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[10px] font-bold uppercase tracking-widest text-brand-muted">{children}</div>
  );
}

function freightLabel(mode: string | null): string {
  if (mode === "air") return "Air freight";
  if (mode === "sea") return "Sea freight";
  return mode ?? "—";
}

function fmtGbp(amount: number): string {
  return new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 2 }).format(amount);
}
