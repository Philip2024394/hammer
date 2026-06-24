// Trade-order email helpers. Three orchestration entry points map to the
// three buyer-facing lifecycle events:
//
//   sendTradeOrderConfirmation(orderId)  — buyer submits, admin + buyer
//                                          each receive a copy in parallel.
//   sendTradeOrderQuoted(orderId)        — admin enters freight + total,
//                                          buyer gets "quote ready" mail.
//   sendTradeOrderConfirmed(orderId)     — admin marks dispatched + adds
//                                          tracking ref, buyer gets a
//                                          dispatched email.
//
// Each helper:
//   1. Reads the order row + items + linked trade account.
//   2. Composes a clean HTML email (inline <style>) + plain-text fallback.
//   3. Sends via Resend.
//   4. Logs every send attempt to hammerex_trade_email_log (one row per
//      recipient, including the Resend message_id or the error string).
//
// Wiring contract for Agent C (order submission endpoint): after inserting
// the order row, call `sendTradeOrderConfirmation(orderId)` and forget —
// errors are caught inside and recorded to the email log; we never throw
// out of the helper. That keeps order-submission resilient to a transient
// Resend outage.

import "server-only";
import { Resend } from "resend";
import { supabaseAdmin } from "./supabaseAdmin";
import { formatTradePrice } from "./trade-fx";
import { FX, type Currency } from "./fx";

// --- Config -------------------------------------------------------------

const FROM_EMAIL =
  process.env.HAMMEREX_TRADE_FROM_EMAIL ||
  "Hammerex Trade <orders@hammerexdirect.com>";

const ADMIN_EMAIL =
  process.env.HAMMEREX_TRADE_ADMIN_EMAIL || "philip@hammerexdirect.com";

const SITE_URL =
  process.env.NEXT_PUBLIC_HAMMEREX_SITE_URL || "https://hammerexdirect.com";

const WHATSAPP =
  process.env.NEXT_PUBLIC_HAMMEREX_WHATSAPP || "+6281392000050";

// Lazy Resend init — we don't want a hard crash at module load when the
// key is missing in dev. The send call surfaces the error explicitly.
function getResend(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

// --- Types --------------------------------------------------------------

type OrderItem = {
  id: string;
  product_name_snapshot: string | null;
  sku_snapshot: string | null;
  size: string | null;
  thread_color: string | null;
  qty: number;
  unit_price_gbp: number;
  line_total_gbp: number;
};

type Order = {
  id: string;
  order_number: string;
  account_id: string;
  status: string;
  freight_mode: string | null;
  incoterm: string | null;
  currency: string;
  subtotal_gbp: number;
  freight_quote_gbp: number | null;
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
};

type Account = {
  id: string;
  trade_account_no: string;
  company_name: string;
  contact_name: string | null;
  contact_email: string;
  contact_phone: string | null;
  country: string | null;
  currency: string;
};

export type TradeOrderEmailType =
  | "submit_admin"
  | "submit_buyer"
  | "quoted_buyer"
  | "confirmed_buyer"
  | "manual_resend";

// --- Data loader --------------------------------------------------------

async function loadOrderBundle(orderId: string): Promise<
  | { ok: true; order: Order; items: OrderItem[]; account: Account }
  | { ok: false; error: string }
> {
  const orderRes = await supabaseAdmin
    .from("hammerex_trade_orders")
    .select(
      "id, order_number, account_id, status, freight_mode, incoterm, currency, subtotal_gbp, freight_quote_gbp, total_gbp, ship_to_country, ship_to_address, customer_notes, admin_notes, tracking_ref, submitted_at, quoted_at, confirmed_at, dispatched_at, delivered_at"
    )
    .eq("id", orderId)
    .maybeSingle();
  if (orderRes.error || !orderRes.data) {
    return { ok: false, error: orderRes.error?.message || "Order not found" };
  }
  const order = orderRes.data as Order;

  const [itemsRes, accountRes] = await Promise.all([
    supabaseAdmin
      .from("hammerex_trade_order_items")
      .select(
        "id, product_name_snapshot, sku_snapshot, size, thread_color, qty, unit_price_gbp, line_total_gbp"
      )
      .eq("order_id", orderId)
      .order("id", { ascending: true }),
    supabaseAdmin
      .from("hammerex_trade_accounts")
      .select(
        "id, trade_account_no, company_name, contact_name, contact_email, contact_phone, country, currency"
      )
      .eq("id", order.account_id)
      .maybeSingle()
  ]);

  if (itemsRes.error) return { ok: false, error: itemsRes.error.message };
  if (accountRes.error || !accountRes.data) {
    return { ok: false, error: accountRes.error?.message || "Account not found" };
  }

  return {
    ok: true,
    order,
    items: (itemsRes.data ?? []) as OrderItem[],
    account: accountRes.data as Account
  };
}

// --- Formatting helpers -------------------------------------------------

function fmtGbp(amount: number | null | undefined): string {
  if (amount == null) return "—";
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: 2
  }).format(amount);
}

function fmtAccountCurrencyFromGbp(amountGbp: number | null | undefined, accountCurrency: string): string {
  if (amountGbp == null) return "—";
  return formatTradePrice(amountGbp, accountCurrency);
}

function fmtDateTime(iso: string | null | undefined): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("en-GB", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "UTC"
    }) + " UTC";
  } catch {
    return iso;
  }
}

function freightModeLabel(mode: string | null | undefined): string {
  if (mode === "air") return "Air freight";
  if (mode === "sea") return "Sea freight";
  if (mode) return mode.charAt(0).toUpperCase() + mode.slice(1);
  return "—";
}

function escapeHtml(input: string | null | undefined): string {
  if (input == null) return "";
  return String(input)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// Currency code guard for trade-fx (it accepts Currency | string). We don't
// want to bork an email render over a typo in account currency.
function safeCurrency(code: string): Currency | string {
  return code in FX ? (code as Currency) : "GBP";
}

// --- Email log writer ---------------------------------------------------

async function logSend(args: {
  orderId: string;
  recipientEmail: string;
  emailType: TradeOrderEmailType;
  resendMessageId?: string | null;
  error?: string | null;
}): Promise<void> {
  await supabaseAdmin.from("hammerex_trade_email_log").insert({
    order_id: args.orderId,
    recipient_email: args.recipientEmail,
    email_type: args.emailType,
    resend_message_id: args.resendMessageId ?? null,
    error: args.error ?? null
  });
}

// --- HTML chrome --------------------------------------------------------

// Inline-style chunks reused across templates. Email clients vary in their
// CSS support, so we keep this dead-simple: table-based layout, inline
// styles only, brand colours hard-coded (no CSS vars).
const COLOR_BG = "#0c0c0c";
const COLOR_SURFACE = "#161616";
const COLOR_LINE = "#262626";
const COLOR_TEXT = "#f5f5f5";
const COLOR_MUTED = "#9a9a9a";
const COLOR_ACCENT = "#FFB300";

function shell(args: { title: string; preheader: string; bodyHtml: string }): string {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(args.title)}</title>
  <style>
    body { margin: 0; padding: 0; background: ${COLOR_BG}; }
    table { border-collapse: collapse; }
    a { color: ${COLOR_ACCENT}; }
  </style>
</head>
<body style="margin:0;padding:0;background:${COLOR_BG};">
  <span style="display:none !important;opacity:0;color:transparent;height:0;width:0;overflow:hidden;mso-hide:all;">${escapeHtml(args.preheader)}</span>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${COLOR_BG};padding:32px 12px;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:${COLOR_SURFACE};border:1px solid ${COLOR_LINE};border-radius:16px;overflow:hidden;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:${COLOR_TEXT};">
        <tr><td style="padding:24px 28px 0 28px;">
          <div style="font-size:13px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:${COLOR_ACCENT};">Hammerex Trade</div>
        </td></tr>
        ${args.bodyHtml}
        <tr><td style="padding:20px 28px 28px 28px;border-top:1px solid ${COLOR_LINE};font-size:12px;color:${COLOR_MUTED};line-height:1.6;">
          Hammerex — 15 years of UK-distributed pro tool gear, now direct from the maker.<br />
          <a href="${SITE_URL}" style="color:${COLOR_ACCENT};text-decoration:none;">hammerexdirect.com</a> · WhatsApp ${escapeHtml(WHATSAPP)} · ${escapeHtml(ADMIN_EMAIL)}
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function lineItemRows(items: OrderItem[], accountCurrency: string): string {
  if (items.length === 0) {
    return `<tr><td colspan="6" style="padding:14px;text-align:center;color:${COLOR_MUTED};font-size:13px;">No line items.</td></tr>`;
  }
  return items.map((it) => {
    const variantBits: string[] = [];
    if (it.size) variantBits.push(`Size: ${escapeHtml(it.size)}`);
    if (it.thread_color) variantBits.push(`Thread: ${escapeHtml(it.thread_color)}`);
    const variant = variantBits.length ? variantBits.join(" · ") : "—";
    const accLine = accountCurrency.toUpperCase() === "GBP"
      ? ""
      : `<div style="color:${COLOR_MUTED};font-size:11px;">${escapeHtml(fmtAccountCurrencyFromGbp(it.line_total_gbp, accountCurrency))}</div>`;
    return `
      <tr style="border-top:1px solid ${COLOR_LINE};">
        <td style="padding:10px 8px;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:12px;color:${COLOR_ACCENT};vertical-align:top;">${escapeHtml(it.sku_snapshot || "—")}</td>
        <td style="padding:10px 8px;font-size:13px;vertical-align:top;">${escapeHtml(it.product_name_snapshot || "—")}</td>
        <td style="padding:10px 8px;font-size:12px;color:${COLOR_MUTED};vertical-align:top;">${variant}</td>
        <td style="padding:10px 8px;font-size:13px;text-align:right;vertical-align:top;">${it.qty}</td>
        <td style="padding:10px 8px;font-size:13px;text-align:right;vertical-align:top;">${escapeHtml(fmtGbp(it.unit_price_gbp))}</td>
        <td style="padding:10px 8px;font-size:13px;text-align:right;vertical-align:top;">
          <div>${escapeHtml(fmtGbp(it.line_total_gbp))}</div>
          ${accLine}
        </td>
      </tr>`;
  }).join("");
}

function itemsTable(items: OrderItem[], accountCurrency: string): string {
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:12px;border:1px solid ${COLOR_LINE};border-radius:10px;overflow:hidden;">
      <thead>
        <tr style="background:${COLOR_BG};">
          <th align="left" style="padding:8px;font-size:11px;text-transform:uppercase;letter-spacing:1.5px;color:${COLOR_MUTED};font-weight:700;">Ref</th>
          <th align="left" style="padding:8px;font-size:11px;text-transform:uppercase;letter-spacing:1.5px;color:${COLOR_MUTED};font-weight:700;">Product</th>
          <th align="left" style="padding:8px;font-size:11px;text-transform:uppercase;letter-spacing:1.5px;color:${COLOR_MUTED};font-weight:700;">Variant</th>
          <th align="right" style="padding:8px;font-size:11px;text-transform:uppercase;letter-spacing:1.5px;color:${COLOR_MUTED};font-weight:700;">Qty</th>
          <th align="right" style="padding:8px;font-size:11px;text-transform:uppercase;letter-spacing:1.5px;color:${COLOR_MUTED};font-weight:700;">Unit £</th>
          <th align="right" style="padding:8px;font-size:11px;text-transform:uppercase;letter-spacing:1.5px;color:${COLOR_MUTED};font-weight:700;">Line total</th>
        </tr>
      </thead>
      <tbody>${lineItemRows(items, accountCurrency)}</tbody>
    </table>`;
}

function totalsBlock(args: {
  subtotalGbp: number;
  freightGbp: number | null;
  totalGbp: number | null;
  freightMode: string | null;
  incoterm: string | null;
  accountCurrency: string;
}): string {
  const rows: string[] = [];
  rows.push(`<tr><td style="padding:4px 8px;font-size:13px;color:${COLOR_MUTED};">Subtotal</td><td align="right" style="padding:4px 8px;font-size:13px;">${escapeHtml(fmtGbp(args.subtotalGbp))}</td></tr>`);
  if (args.freightGbp != null) {
    rows.push(`<tr><td style="padding:4px 8px;font-size:13px;color:${COLOR_MUTED};">Freight (${escapeHtml(freightModeLabel(args.freightMode))})</td><td align="right" style="padding:4px 8px;font-size:13px;">${escapeHtml(fmtGbp(args.freightGbp))}</td></tr>`);
  } else {
    rows.push(`<tr><td style="padding:4px 8px;font-size:13px;color:${COLOR_MUTED};">Freight (${escapeHtml(freightModeLabel(args.freightMode))})</td><td align="right" style="padding:4px 8px;font-size:13px;color:${COLOR_MUTED};">To be quoted</td></tr>`);
  }
  rows.push(`<tr><td style="padding:4px 8px;font-size:13px;color:${COLOR_MUTED};">Incoterm</td><td align="right" style="padding:4px 8px;font-size:13px;">${escapeHtml(args.incoterm || "—")}</td></tr>`);
  if (args.totalGbp != null) {
    rows.push(`<tr><td style="padding:8px;font-size:14px;font-weight:700;border-top:1px solid ${COLOR_LINE};">Total</td><td align="right" style="padding:8px;font-size:14px;font-weight:700;border-top:1px solid ${COLOR_LINE};color:${COLOR_ACCENT};">${escapeHtml(fmtGbp(args.totalGbp))}</td></tr>`);
    if (args.accountCurrency.toUpperCase() !== "GBP") {
      rows.push(`<tr><td style="padding:0 8px 8px 8px;font-size:11px;color:${COLOR_MUTED};">Indicative (${escapeHtml(args.accountCurrency)})</td><td align="right" style="padding:0 8px 8px 8px;font-size:11px;color:${COLOR_MUTED};">${escapeHtml(fmtAccountCurrencyFromGbp(args.totalGbp, args.accountCurrency))}</td></tr>`);
    }
  }
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:12px;border:1px solid ${COLOR_LINE};border-radius:10px;background:${COLOR_BG};">
      ${rows.join("")}
    </table>`;
}

// --- Plain-text fallback builders --------------------------------------

function itemsPlainText(items: OrderItem[]): string {
  if (items.length === 0) return "(no items)";
  return items.map((it) => {
    const variant = [it.size && `size ${it.size}`, it.thread_color && `thread ${it.thread_color}`].filter(Boolean).join(", ") || "—";
    return `  - [${it.sku_snapshot || "—"}] ${it.product_name_snapshot || "—"} (${variant}) x${it.qty} @ ${fmtGbp(it.unit_price_gbp)} = ${fmtGbp(it.line_total_gbp)}`;
  }).join("\n");
}

// --- Template: admin email on submit -----------------------------------

function adminSubmitTemplate(order: Order, items: OrderItem[], account: Account) {
  const subject = `[TRADE ORDER ${order.order_number}] Submitted by ${account.company_name} — ${fmtGbp(order.subtotal_gbp)}`;
  const adminLink = `${SITE_URL}/admin/trade-orders/${order.id}`;

  const headerBlock = `
    <tr><td style="padding:8px 28px 0 28px;">
      <h1 style="margin:8px 0 4px 0;font-size:20px;color:${COLOR_TEXT};">New trade order submitted</h1>
      <p style="margin:0;font-size:13px;color:${COLOR_MUTED};">${escapeHtml(order.order_number)} · ${escapeHtml(fmtDateTime(order.submitted_at))}</p>
    </td></tr>`;

  const accountBlock = `
    <tr><td style="padding:16px 28px 0 28px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid ${COLOR_LINE};border-radius:10px;background:${COLOR_BG};">
        <tr>
          <td style="padding:12px;font-size:13px;width:50%;vertical-align:top;">
            <div style="font-size:11px;text-transform:uppercase;letter-spacing:1.5px;color:${COLOR_MUTED};">Buyer</div>
            <div style="font-weight:600;">${escapeHtml(account.company_name)}</div>
            <div style="color:${COLOR_MUTED};font-size:12px;">${escapeHtml(account.trade_account_no)}</div>
            ${account.contact_name ? `<div style="color:${COLOR_MUTED};font-size:12px;">${escapeHtml(account.contact_name)}</div>` : ""}
          </td>
          <td style="padding:12px;font-size:13px;width:50%;vertical-align:top;">
            <div style="font-size:11px;text-transform:uppercase;letter-spacing:1.5px;color:${COLOR_MUTED};">Contact</div>
            <div><a href="mailto:${escapeHtml(account.contact_email)}" style="color:${COLOR_ACCENT};">${escapeHtml(account.contact_email)}</a></div>
            ${account.contact_phone ? `<div style="font-size:12px;">${escapeHtml(account.contact_phone)}</div>` : ""}
            ${account.country ? `<div style="font-size:12px;color:${COLOR_MUTED};">${escapeHtml(account.country)}</div>` : ""}
          </td>
        </tr>
      </table>
    </td></tr>`;

  const itemsBlock = `
    <tr><td style="padding:16px 28px 0 28px;">
      ${itemsTable(items, account.currency)}
    </td></tr>
    <tr><td style="padding:8px 28px 0 28px;">
      ${totalsBlock({ subtotalGbp: order.subtotal_gbp, freightGbp: order.freight_quote_gbp, totalGbp: order.total_gbp, freightMode: order.freight_mode, incoterm: order.incoterm, accountCurrency: account.currency })}
    </td></tr>`;

  const shipToBlock = order.ship_to_address ? `
    <tr><td style="padding:16px 28px 0 28px;">
      <div style="font-size:11px;text-transform:uppercase;letter-spacing:1.5px;color:${COLOR_MUTED};">Ship to (${escapeHtml(order.ship_to_country || "—")})</div>
      <div style="white-space:pre-line;font-size:13px;background:${COLOR_BG};border:1px solid ${COLOR_LINE};border-radius:8px;padding:10px;margin-top:6px;">${escapeHtml(order.ship_to_address)}</div>
    </td></tr>` : "";

  const notesBlock = order.customer_notes ? `
    <tr><td style="padding:16px 28px 0 28px;">
      <div style="font-size:11px;text-transform:uppercase;letter-spacing:1.5px;color:${COLOR_MUTED};">Customer notes</div>
      <div style="white-space:pre-line;font-size:13px;background:${COLOR_BG};border:1px solid ${COLOR_LINE};border-radius:8px;padding:10px;margin-top:6px;">${escapeHtml(order.customer_notes)}</div>
    </td></tr>` : "";

  const ctaBlock = `
    <tr><td style="padding:20px 28px 4px 28px;">
      <a href="${adminLink}" style="display:inline-block;background:${COLOR_ACCENT};color:#000;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;font-size:13px;padding:12px 20px;border-radius:999px;text-decoration:none;">View in admin →</a>
    </td></tr>`;

  const bodyHtml = `${headerBlock}${accountBlock}${itemsBlock}${shipToBlock}${notesBlock}${ctaBlock}`;
  const html = shell({ title: subject, preheader: `New ${order.order_number} from ${account.company_name}`, bodyHtml });

  const text = [
    `NEW TRADE ORDER SUBMITTED`,
    `Order: ${order.order_number}`,
    `Submitted: ${fmtDateTime(order.submitted_at)}`,
    ``,
    `Buyer: ${account.company_name} (${account.trade_account_no})`,
    `Contact: ${account.contact_name || "—"} <${account.contact_email}> ${account.contact_phone || ""}`,
    `Country: ${account.country || "—"}`,
    ``,
    `Items:`,
    itemsPlainText(items),
    ``,
    `Subtotal: ${fmtGbp(order.subtotal_gbp)}`,
    `Freight: ${freightModeLabel(order.freight_mode)} (to be quoted)`,
    `Incoterm: ${order.incoterm || "—"}`,
    ``,
    `Ship to (${order.ship_to_country || "—"}):`,
    order.ship_to_address || "—",
    ``,
    order.customer_notes ? `Customer notes:\n${order.customer_notes}\n` : "",
    `View in admin: ${adminLink}`
  ].filter(Boolean).join("\n");

  return { subject, html, text };
}

// --- Template: buyer email on submit -----------------------------------

function buyerSubmitTemplate(order: Order, items: OrderItem[], account: Account) {
  const subject = `Order ${order.order_number} received — Hammerex will confirm within 24h`;
  const greetTo = account.contact_name || account.company_name;

  const headerBlock = `
    <tr><td style="padding:8px 28px 0 28px;">
      <h1 style="margin:8px 0 4px 0;font-size:20px;color:${COLOR_TEXT};">Order received</h1>
      <p style="margin:0;font-size:13px;color:${COLOR_MUTED};">${escapeHtml(order.order_number)} · ${escapeHtml(fmtDateTime(order.submitted_at))}</p>
    </td></tr>`;

  const greetBlock = `
    <tr><td style="padding:16px 28px 0 28px;font-size:14px;line-height:1.6;">
      Hi ${escapeHtml(greetTo)},<br /><br />
      We have received your trade order <strong>${escapeHtml(order.order_number)}</strong>. Total goods value: <strong>${escapeHtml(fmtGbp(order.subtotal_gbp))}</strong>${account.currency.toUpperCase() !== "GBP" ? ` <span style="color:${COLOR_MUTED};">(indicative ${escapeHtml(fmtAccountCurrencyFromGbp(order.subtotal_gbp, account.currency))})</span>` : ""}. Freight: ${escapeHtml(freightModeLabel(order.freight_mode))}, Incoterm: ${escapeHtml(order.incoterm || "—")}.
    </td></tr>`;

  const noticeBlock = `
    <tr><td style="padding:16px 28px 0 28px;">
      <div style="border:1px solid ${COLOR_ACCENT};background:rgba(255,179,0,0.08);border-radius:10px;padding:12px 14px;font-size:13px;line-height:1.55;color:${COLOR_TEXT};">
        <strong style="color:${COLOR_ACCENT};">This is not yet a confirmed total.</strong><br />
        The Hammerex team will reply within 24 working hours with the final freight cost and bank transfer details for payment.
      </div>
    </td></tr>`;

  const itemsBlock = `
    <tr><td style="padding:16px 28px 0 28px;">
      ${itemsTable(items, account.currency)}
    </td></tr>
    <tr><td style="padding:8px 28px 0 28px;">
      ${totalsBlock({ subtotalGbp: order.subtotal_gbp, freightGbp: null, totalGbp: null, freightMode: order.freight_mode, incoterm: order.incoterm, accountCurrency: account.currency })}
    </td></tr>`;

  const shipBlock = order.ship_to_address ? `
    <tr><td style="padding:16px 28px 0 28px;">
      <div style="font-size:11px;text-transform:uppercase;letter-spacing:1.5px;color:${COLOR_MUTED};">Ship to (${escapeHtml(order.ship_to_country || "—")})</div>
      <div style="white-space:pre-line;font-size:13px;background:${COLOR_BG};border:1px solid ${COLOR_LINE};border-radius:8px;padding:10px;margin-top:6px;">${escapeHtml(order.ship_to_address)}</div>
    </td></tr>` : "";

  const contactBlock = `
    <tr><td style="padding:20px 28px 0 28px;">
      <div style="font-size:11px;text-transform:uppercase;letter-spacing:1.5px;color:${COLOR_MUTED};">Direct line</div>
      <div style="font-size:13px;margin-top:4px;">Philip O'Farrell · <a href="https://wa.me/${escapeHtml(WHATSAPP.replace(/[^0-9]/g, ""))}" style="color:${COLOR_ACCENT};">WhatsApp ${escapeHtml(WHATSAPP)}</a> · <a href="mailto:${escapeHtml(ADMIN_EMAIL)}" style="color:${COLOR_ACCENT};">${escapeHtml(ADMIN_EMAIL)}</a></div>
    </td></tr>`;

  const bodyHtml = `${headerBlock}${greetBlock}${noticeBlock}${itemsBlock}${shipBlock}${contactBlock}`;
  const html = shell({ title: subject, preheader: `${order.order_number} received — confirmation within 24h`, bodyHtml });

  const text = [
    `Hi ${greetTo},`,
    ``,
    `We have received your trade order ${order.order_number}.`,
    `Total goods value: ${fmtGbp(order.subtotal_gbp)}.`,
    `Freight mode: ${freightModeLabel(order.freight_mode)}. Incoterm: ${order.incoterm || "—"}.`,
    ``,
    `THIS IS NOT A CONFIRMED TOTAL. The Hammerex team will reply within 24 working hours with the final freight cost and bank transfer details for payment.`,
    ``,
    `Items:`,
    itemsPlainText(items),
    ``,
    `Subtotal: ${fmtGbp(order.subtotal_gbp)}`,
    `Ship to (${order.ship_to_country || "—"}):`,
    order.ship_to_address || "—",
    ``,
    `Direct line — Philip O'Farrell — WhatsApp ${WHATSAPP} — ${ADMIN_EMAIL}`,
    `Hammerex — 15 years of UK-distributed pro tool gear, now direct from the maker.`
  ].join("\n");

  return { subject, html, text };
}

// --- Template: buyer quoted -------------------------------------------

function buyerQuotedTemplate(order: Order, items: OrderItem[], account: Account) {
  const subject = `Quote ready for order ${order.order_number} — please confirm`;
  const greetTo = account.contact_name || account.company_name;

  const headerBlock = `
    <tr><td style="padding:8px 28px 0 28px;">
      <h1 style="margin:8px 0 4px 0;font-size:20px;color:${COLOR_TEXT};">Your quote is ready</h1>
      <p style="margin:0;font-size:13px;color:${COLOR_MUTED};">${escapeHtml(order.order_number)} · quoted ${escapeHtml(fmtDateTime(order.quoted_at))}</p>
    </td></tr>`;

  const greetBlock = `
    <tr><td style="padding:16px 28px 0 28px;font-size:14px;line-height:1.6;">
      Hi ${escapeHtml(greetTo)},<br /><br />
      Your freight quote for order <strong>${escapeHtml(order.order_number)}</strong> is ready. Please review the totals below and reply to this email to accept — we'll send bank transfer details for payment as soon as you confirm.
    </td></tr>`;

  const itemsBlock = `
    <tr><td style="padding:16px 28px 0 28px;">
      ${itemsTable(items, account.currency)}
    </td></tr>
    <tr><td style="padding:8px 28px 0 28px;">
      ${totalsBlock({ subtotalGbp: order.subtotal_gbp, freightGbp: order.freight_quote_gbp, totalGbp: order.total_gbp, freightMode: order.freight_mode, incoterm: order.incoterm, accountCurrency: account.currency })}
    </td></tr>`;

  const noticeBlock = order.admin_notes ? `
    <tr><td style="padding:16px 28px 0 28px;">
      <div style="font-size:11px;text-transform:uppercase;letter-spacing:1.5px;color:${COLOR_MUTED};">Hammerex note</div>
      <div style="white-space:pre-line;font-size:13px;background:${COLOR_BG};border:1px solid ${COLOR_LINE};border-radius:8px;padding:10px;margin-top:6px;">${escapeHtml(order.admin_notes)}</div>
    </td></tr>` : "";

  const ctaBlock = `
    <tr><td style="padding:20px 28px 0 28px;">
      <a href="mailto:${escapeHtml(ADMIN_EMAIL)}?subject=${encodeURIComponent(`Accept quote ${order.order_number}`)}" style="display:inline-block;background:${COLOR_ACCENT};color:#000;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;font-size:13px;padding:12px 20px;border-radius:999px;text-decoration:none;">Accept and request bank details →</a>
    </td></tr>
    <tr><td style="padding:8px 28px 0 28px;font-size:12px;color:${COLOR_MUTED};">
      Or reply to this email with "accept" and we'll send the wire instructions.
    </td></tr>`;

  const bodyHtml = `${headerBlock}${greetBlock}${itemsBlock}${noticeBlock}${ctaBlock}`;
  const html = shell({ title: subject, preheader: `Total ${fmtGbp(order.total_gbp)} — reply to accept`, bodyHtml });

  const text = [
    `Hi ${greetTo},`,
    ``,
    `Your freight quote for order ${order.order_number} is ready.`,
    ``,
    `Items:`,
    itemsPlainText(items),
    ``,
    `Subtotal: ${fmtGbp(order.subtotal_gbp)}`,
    `Freight (${freightModeLabel(order.freight_mode)}): ${fmtGbp(order.freight_quote_gbp)}`,
    `Incoterm: ${order.incoterm || "—"}`,
    `TOTAL: ${fmtGbp(order.total_gbp)}`,
    account.currency.toUpperCase() !== "GBP" ? `Indicative total (${account.currency}): ${fmtAccountCurrencyFromGbp(order.total_gbp, account.currency)}` : "",
    ``,
    order.admin_notes ? `Hammerex note:\n${order.admin_notes}\n` : "",
    `Reply to this email with "accept" and we'll send the wire instructions.`,
    ``,
    `Philip O'Farrell — Hammerex — ${WHATSAPP} — ${ADMIN_EMAIL}`
  ].filter(Boolean).join("\n");

  return { subject, html, text };
}

// --- Template: buyer dispatched ---------------------------------------

function buyerDispatchedTemplate(order: Order, items: OrderItem[], account: Account) {
  const trackingRef = order.tracking_ref || "(awaiting carrier reference)";
  const subject = `Order ${order.order_number} dispatched — tracking: ${trackingRef}`;
  const greetTo = account.contact_name || account.company_name;

  const eta = order.freight_mode === "sea" ? "approx. 25–40 days by sea" : "approx. 5–10 days by air";

  const headerBlock = `
    <tr><td style="padding:8px 28px 0 28px;">
      <h1 style="margin:8px 0 4px 0;font-size:20px;color:${COLOR_TEXT};">Dispatched</h1>
      <p style="margin:0;font-size:13px;color:${COLOR_MUTED};">${escapeHtml(order.order_number)} · ${escapeHtml(fmtDateTime(order.dispatched_at))}</p>
    </td></tr>`;

  const greetBlock = `
    <tr><td style="padding:16px 28px 0 28px;font-size:14px;line-height:1.6;">
      Hi ${escapeHtml(greetTo)},<br /><br />
      Good news — your trade order <strong>${escapeHtml(order.order_number)}</strong> is on its way.
    </td></tr>`;

  const trackingBlock = `
    <tr><td style="padding:16px 28px 0 28px;">
      <div style="border:1px solid ${COLOR_ACCENT};background:rgba(255,179,0,0.08);border-radius:10px;padding:14px;">
        <div style="font-size:11px;text-transform:uppercase;letter-spacing:1.5px;color:${COLOR_ACCENT};">Tracking reference</div>
        <div style="font-size:18px;font-weight:700;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;margin-top:4px;">${escapeHtml(trackingRef)}</div>
        <div style="font-size:12px;color:${COLOR_MUTED};margin-top:6px;">${escapeHtml(freightModeLabel(order.freight_mode))} · ETA ${escapeHtml(eta)}</div>
      </div>
    </td></tr>`;

  const itemsBlock = `
    <tr><td style="padding:16px 28px 0 28px;">
      ${itemsTable(items, account.currency)}
    </td></tr>
    <tr><td style="padding:8px 28px 0 28px;">
      ${totalsBlock({ subtotalGbp: order.subtotal_gbp, freightGbp: order.freight_quote_gbp, totalGbp: order.total_gbp, freightMode: order.freight_mode, incoterm: order.incoterm, accountCurrency: account.currency })}
    </td></tr>`;

  const contactBlock = `
    <tr><td style="padding:20px 28px 0 28px;font-size:13px;line-height:1.6;color:${COLOR_MUTED};">
      Anything wrong with the shipment? Reply to this email or message Philip on <a href="https://wa.me/${escapeHtml(WHATSAPP.replace(/[^0-9]/g, ""))}" style="color:${COLOR_ACCENT};">WhatsApp ${escapeHtml(WHATSAPP)}</a>.
    </td></tr>`;

  const bodyHtml = `${headerBlock}${greetBlock}${trackingBlock}${itemsBlock}${contactBlock}`;
  const html = shell({ title: subject, preheader: `Tracking ${trackingRef} · ETA ${eta}`, bodyHtml });

  const text = [
    `Hi ${greetTo},`,
    ``,
    `Your trade order ${order.order_number} is on its way.`,
    `Tracking reference: ${trackingRef}`,
    `${freightModeLabel(order.freight_mode)} — ETA ${eta}`,
    ``,
    `Items:`,
    itemsPlainText(items),
    ``,
    `Subtotal: ${fmtGbp(order.subtotal_gbp)}`,
    `Freight: ${fmtGbp(order.freight_quote_gbp)}`,
    `Total: ${fmtGbp(order.total_gbp)}`,
    ``,
    `Issues? Reply to this email or WhatsApp ${WHATSAPP}.`,
    `Philip O'Farrell — Hammerex`
  ].join("\n");

  return { subject, html, text };
}

// --- Send helpers -------------------------------------------------------

async function dispatchEmail(args: {
  orderId: string;
  to: string;
  emailType: TradeOrderEmailType;
  subject: string;
  html: string;
  text: string;
}): Promise<{ ok: boolean; id?: string; error?: string }> {
  const resend = getResend();
  if (!resend) {
    const error = "RESEND_API_KEY missing — email not sent.";
    await logSend({ orderId: args.orderId, recipientEmail: args.to, emailType: args.emailType, error });
    return { ok: false, error };
  }
  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: args.to,
      subject: args.subject,
      html: args.html,
      text: args.text
    });
    if (error || !data?.id) {
      const errMsg = error?.message || "Unknown Resend error";
      await logSend({ orderId: args.orderId, recipientEmail: args.to, emailType: args.emailType, error: errMsg });
      return { ok: false, error: errMsg };
    }
    await logSend({ orderId: args.orderId, recipientEmail: args.to, emailType: args.emailType, resendMessageId: data.id });
    return { ok: true, id: data.id };
  } catch (e) {
    const errMsg = (e as Error).message;
    await logSend({ orderId: args.orderId, recipientEmail: args.to, emailType: args.emailType, error: errMsg });
    return { ok: false, error: errMsg };
  }
}

// --- Public entry points ----------------------------------------------

/**
 * Order-submission notification fan-out. Sends two emails in parallel:
 *   1. Admin alert (TO: HAMMEREX_TRADE_ADMIN_EMAIL)
 *   2. Buyer confirmation (TO: account.contact_email)
 *
 * Never throws — internal errors are caught and recorded to
 * hammerex_trade_email_log. Returns a summary so the caller can decide
 * whether to surface a warning to the user.
 */
export async function sendTradeOrderConfirmation(orderId: string): Promise<{
  admin: { ok: boolean; id?: string; error?: string };
  buyer: { ok: boolean; id?: string; error?: string };
}> {
  const bundle = await loadOrderBundle(orderId);
  if (!bundle.ok) {
    const err = bundle.error;
    return { admin: { ok: false, error: err }, buyer: { ok: false, error: err } };
  }
  const { order, items, account } = bundle;

  const adminTpl = adminSubmitTemplate(order, items, account);
  const buyerTpl = buyerSubmitTemplate(order, items, account);

  const [admin, buyer] = await Promise.all([
    dispatchEmail({ orderId: order.id, to: ADMIN_EMAIL, emailType: "submit_admin", ...adminTpl }),
    dispatchEmail({ orderId: order.id, to: account.contact_email, emailType: "submit_buyer", ...buyerTpl })
  ]);

  return { admin, buyer };
}

/** Buyer email triggered when the admin flips status to 'quoted' with
 *  freight cost + total. */
export async function sendTradeOrderQuoted(orderId: string): Promise<{ ok: boolean; id?: string; error?: string }> {
  const bundle = await loadOrderBundle(orderId);
  if (!bundle.ok) return { ok: false, error: bundle.error };
  const { order, items, account } = bundle;
  const tpl = buyerQuotedTemplate(order, items, account);
  return dispatchEmail({ orderId: order.id, to: account.contact_email, emailType: "quoted_buyer", ...tpl });
}

/** Buyer email triggered when the admin marks the order dispatched. */
export async function sendTradeOrderConfirmed(orderId: string): Promise<{ ok: boolean; id?: string; error?: string }> {
  const bundle = await loadOrderBundle(orderId);
  if (!bundle.ok) return { ok: false, error: bundle.error };
  const { order, items, account } = bundle;
  const tpl = buyerDispatchedTemplate(order, items, account);
  return dispatchEmail({ orderId: order.id, to: account.contact_email, emailType: "confirmed_buyer", ...tpl });
}

/**
 * Owner-triggered manual resend of whichever email best matches the
 * order's current status. Useful when Resend hiccupped or the buyer
 * misplaced the original. Always logs with email_type='manual_resend'
 * alongside the real underlying type's content.
 */
export async function manualResendForOrder(orderId: string): Promise<{
  admin?: { ok: boolean; id?: string; error?: string };
  buyer: { ok: boolean; id?: string; error?: string };
}> {
  const bundle = await loadOrderBundle(orderId);
  if (!bundle.ok) {
    return { buyer: { ok: false, error: bundle.error } };
  }
  const { order, items, account } = bundle;
  let tpl: { subject: string; html: string; text: string };
  if (order.status === "dispatched" || order.status === "delivered") {
    tpl = buyerDispatchedTemplate(order, items, account);
  } else if (order.status === "quoted" || order.status === "awaiting_payment" || order.status === "paid") {
    tpl = buyerQuotedTemplate(order, items, account);
  } else {
    // submitted / cancelled / fallback → resend the submit confirmation
    tpl = buyerSubmitTemplate(order, items, account);
  }
  const buyer = await dispatchEmail({ orderId: order.id, to: account.contact_email, emailType: "manual_resend", ...tpl });

  // Also re-ping the admin if this is the submit-stage state
  if (order.status === "submitted") {
    const adminTpl = adminSubmitTemplate(order, items, account);
    const admin = await dispatchEmail({ orderId: order.id, to: ADMIN_EMAIL, emailType: "manual_resend", ...adminTpl });
    return { admin, buyer };
  }
  return { buyer };
}
