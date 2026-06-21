import { supabase } from "@/lib/supabase";
import { CaptureButton } from "./CaptureButton";

export const dynamic = "force-dynamic";

type Address =
  | { line1?: string; line2?: string; city?: string; postal_code?: string; state?: string; country?: string }
  | { address?: { line1?: string; line2?: string; city?: string; postal_code?: string; state?: string; country?: string }; name?: string; phone?: string }
  | null;

type Order = {
  id: string;
  status: string;
  total_pence: number;
  subtotal_pence: number;
  shipping_pence: number;
  currency: string;
  created_at: string;
  authorized_at: string | null;
  captured_at: string | null;
  buyer_email: string | null;
  buyer_name: string | null;
  buyer_phone: string | null;
  shipping_address: Address;
  line_items: { productId: string; qty: number; size?: string | null; variantLabel?: string | null; threadColor?: string | null; beltSize?: string | null; customBrandName?: string | null; repairCover?: boolean; backpackStraps?: boolean; beltUpgrade?: string | null }[] | null;
  stripe_session_id: string | null;
};

export default async function AdminOrdersPage({
  searchParams
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const statusFilter = status?.toLowerCase();

  let q = supabase
    .from("hammerex_orders")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);
  if (statusFilter && statusFilter !== "all") q = q.eq("status", statusFilter);

  const res = await q;
  const orders = (res.data ?? []) as Order[];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-bold">Orders</h1>
        <nav className="flex flex-wrap gap-1 text-xs">
          {["all", "pending", "authorized", "captured", "dispatched", "refunded", "cancelled"].map((s) => (
            <a
              key={s}
              href={`/admin/orders${s === "all" ? "" : `?status=${s}`}`}
              className={`rounded-full px-3 py-1.5 font-semibold uppercase tracking-widest ${
                (statusFilter ?? "all") === s
                  ? "bg-brand-accent text-black"
                  : "border border-brand-line text-brand-muted hover:text-brand-text"
              }`}
            >{s}</a>
          ))}
        </nav>
      </div>

      {orders.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-brand-line bg-brand-surface p-8 text-center text-sm text-brand-muted">
          No orders {statusFilter && statusFilter !== "all" ? `in "${statusFilter}"` : ""} yet.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {orders.map((o) => (
            <OrderCard key={o.id} order={o} />
          ))}
        </ul>
      )}
    </div>
  );
}

function OrderCard({ order }: { order: Order }) {
  const addr = flattenAddress(order.shipping_address);
  const lines = order.line_items ?? [];
  return (
    <li className="overflow-hidden rounded-2xl border border-brand-line bg-brand-surface">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-brand-line bg-brand-bg/40 px-4 py-3">
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-brand-muted">#{order.id.slice(0, 8)}</span>
          <span className="rounded-full bg-brand-accent/15 px-2 py-0.5 text-xs font-bold uppercase tracking-widest text-brand-accent">
            {order.status}
          </span>
          <span className="text-xs text-brand-muted">{new Date(order.created_at).toLocaleString()}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-brand-text">
            £{(order.total_pence / 100).toFixed(2)}
          </span>
          <CaptureButton orderId={order.id} status={order.status} />
        </div>
      </header>
      <div className="grid grid-cols-1 gap-4 px-4 py-3 md:grid-cols-2">
        <div>
          <h3 className="mb-1 text-xs font-bold uppercase tracking-widest text-brand-muted">Buyer</h3>
          <div className="text-sm text-brand-text">{order.buyer_name || <em className="text-brand-muted">No name</em>}</div>
          {order.buyer_email && (
            <a href={`mailto:${order.buyer_email}`} className="block text-xs text-brand-accent hover:underline">
              {order.buyer_email}
            </a>
          )}
          {order.buyer_phone && (
            <a href={`tel:${order.buyer_phone}`} className="block text-xs text-brand-accent hover:underline">
              {order.buyer_phone}
            </a>
          )}
        </div>
        <div>
          <h3 className="mb-1 text-xs font-bold uppercase tracking-widest text-brand-muted">Ship to</h3>
          {addr ? (
            <address className="not-italic text-sm text-brand-text">
              {addr.split("\n").map((ln, i) => <div key={i}>{ln}</div>)}
            </address>
          ) : (
            <p className="text-xs text-brand-muted">No address captured.</p>
          )}
        </div>
      </div>
      <div className="border-t border-brand-line px-4 py-3">
        <h3 className="mb-1 text-xs font-bold uppercase tracking-widest text-brand-muted">Line items</h3>
        <ul className="text-xs text-brand-text">
          {lines.length === 0 ? <li className="text-brand-muted">No items.</li> : lines.map((l, i) => (
            <li key={i} className="py-0.5">
              {l.qty}× <span className="font-mono">{l.productId.slice(0, 8)}</span>
              {l.variantLabel && <span className="ml-1 text-brand-muted">· {l.variantLabel}</span>}
              {l.size && <span className="ml-1 text-brand-muted">· size {l.size}</span>}
              {l.beltSize && <span className="ml-1 text-brand-muted">· belt {l.beltSize}</span>}
              {l.threadColor && <span className="ml-1 text-brand-muted">· thread {l.threadColor}</span>}
              {l.customBrandName && <span className="ml-1 text-brand-muted">· brand &ldquo;{l.customBrandName}&rdquo;</span>}
              {l.repairCover && <span className="ml-1 text-brand-accent">· + cover</span>}
              {l.backpackStraps && <span className="ml-1 text-brand-accent">· + straps</span>}
              {l.beltUpgrade && <span className="ml-1 text-brand-accent">· {l.beltUpgrade}</span>}
            </li>
          ))}
        </ul>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-brand-muted">
          <span>
            Subtotal £{((order.subtotal_pence ?? 0) / 100).toFixed(2)} ·
            Shipping £{((order.shipping_pence ?? 0) / 100).toFixed(2)}
          </span>
          {order.stripe_session_id && (
            <a
              href={`https://dashboard.stripe.com/test/payments?search=${encodeURIComponent(order.stripe_session_id)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-accent hover:underline"
            >Open in Stripe →</a>
          )}
        </div>
      </div>
    </li>
  );
}

function flattenAddress(a: Address): string | null {
  if (!a) return null;
  const inner = "address" in a && a.address ? a.address : (a as Record<string, string | undefined>);
  const name = "name" in a ? a.name : null;
  const phone = "phone" in a ? a.phone : null;
  const parts = [
    name,
    inner.line1,
    inner.line2,
    [inner.city, inner.postal_code].filter(Boolean).join(" "),
    inner.state,
    inner.country,
    phone
  ].filter((s): s is string => !!s && s.trim().length > 0);
  return parts.length ? parts.join("\n") : null;
}
