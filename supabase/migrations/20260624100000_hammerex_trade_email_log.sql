-- Trade-order email send log. Every Resend send (admin notify on
-- submit, buyer confirmation, quote-ready, dispatched, owner-triggered
-- resend) writes a row here with the Resend message_id. Lets the owner
-- audit "did the buyer actually receive the quote email?" from the
-- admin order detail page without leaving the app.
--
-- One row per recipient (so the parallel admin + buyer send on submit
-- creates two rows). Errors are captured in the `error` column rather
-- than dropping the row — that way a failed send is still visible.
--
-- No RLS policies: writes happen through the service-role key from
-- the email helper in src/lib/trade-emails.ts.

create table if not exists public.hammerex_trade_email_log (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.hammerex_trade_orders(id) on delete cascade,
  recipient_email text not null,
  email_type text not null check (email_type in (
    'submit_admin',
    'submit_buyer',
    'quoted_buyer',
    'confirmed_buyer',
    'manual_resend'
  )),
  resend_message_id text,
  sent_at timestamptz not null default now(),
  error text
);

create index if not exists hammerex_trade_email_log_order_idx
  on public.hammerex_trade_email_log (order_id, sent_at desc);

create index if not exists hammerex_trade_email_log_recent_idx
  on public.hammerex_trade_email_log (sent_at desc);

alter table public.hammerex_trade_email_log enable row level security;
