-- Quote-request inbox. When a buyer hits "Quote me delivery" on the
-- checkout page their cart snapshot + contact details land here as
-- status='pending'; the admin queue (/admin/orders) picks them up and
-- replies by WhatsApp or email, flipping the row to 'quoted' or
-- 'closed' once the conversation is resolved.
--
-- Distinct from `hammerex_orders` (the Stripe-side order table — uses
-- pence amounts, expects stripe_session_id). Quote requests have no
-- payment lifecycle; if a quoted request ends up paid through Stripe,
-- that becomes a separate hammerex_orders row.
--
-- Public submissions go through /api/quote-requests using the service
-- role, so RLS stays locked down on direct anon writes.

create table if not exists public.hammerex_quote_requests (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique,            -- short Q-XXXXXX code shown to the buyer
  buyer_name text not null,
  buyer_email text not null,
  buyer_whatsapp text not null,
  buyer_country text not null,
  line_items jsonb not null default '[]'::jsonb,
  subtotal_idr integer not null default 0,
  status text not null default 'pending'
    check (status in ('pending','quoted','closed')),
  admin_notes text,
  quoted_at timestamptz,
  closed_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists hammerex_quote_requests_status_idx
  on public.hammerex_quote_requests (status, created_at desc);
create index if not exists hammerex_quote_requests_pending_idx
  on public.hammerex_quote_requests (created_at desc)
  where status = 'pending';

alter table public.hammerex_quote_requests enable row level security;
-- No public read or write policies. Admin reaches the table via the
-- service-role key only; same model we used for hammerex_reviews.
