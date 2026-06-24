// Admin trade-order detail. Server component does the read in one
// roundtrip (order header + items + account + email log), then hands
// everything to the client OrderDetailClient for status-flip forms.

import Link from "next/link";
import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { OrderDetailClient, type EmailLogEntry, type OrderDetail, type OrderItem, type TradeAccountLite } from "./OrderDetailClient";

export const dynamic = "force-dynamic";

export default async function AdminTradeOrderDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const orderRes = await supabaseAdmin
    .from("hammerex_trade_orders")
    .select(
      "id, order_number, account_id, status, freight_mode, incoterm, currency, subtotal_gbp, goods_idr_locked, freight_quote_gbp, freight_quote_idr, total_gbp, ship_to_country, ship_to_address, customer_notes, admin_notes, tracking_ref, submitted_at, quoted_at, confirmed_at, dispatched_at, delivered_at, cancelled_at"
    )
    .eq("id", id)
    .maybeSingle();
  if (orderRes.error || !orderRes.data) {
    return notFound();
  }
  const order = orderRes.data as OrderDetail;

  const [itemsRes, accountRes, logRes] = await Promise.all([
    supabaseAdmin
      .from("hammerex_trade_order_items")
      .select("id, product_name_snapshot, sku_snapshot, size, thread_color, qty, unit_price_gbp, line_total_gbp")
      .eq("order_id", id)
      .order("id", { ascending: true }),
    supabaseAdmin
      .from("hammerex_trade_accounts")
      .select("id, trade_account_no, company_name, contact_name, contact_email, contact_phone, country, currency")
      .eq("id", order.account_id)
      .maybeSingle(),
    supabaseAdmin
      .from("hammerex_trade_email_log")
      .select("id, recipient_email, email_type, resend_message_id, sent_at, error")
      .eq("order_id", id)
      .order("sent_at", { ascending: false })
      .limit(50)
  ]);

  const items = (itemsRes.data ?? []) as OrderItem[];
  const account = (accountRes.data ?? null) as TradeAccountLite | null;
  const emailLog = (logRes.data ?? []) as EmailLogEntry[];

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <Link href="/admin/trade-orders" className="text-[11px] uppercase tracking-widest text-brand-muted hover:text-brand-accent">
            ← Trade orders
          </Link>
          <h1 className="mt-1 font-mono text-2xl font-bold text-brand-accent">{order.order_number}</h1>
        </div>
      </header>

      <OrderDetailClient order={order} items={items} account={account} emailLog={emailLog} />
    </div>
  );
}
