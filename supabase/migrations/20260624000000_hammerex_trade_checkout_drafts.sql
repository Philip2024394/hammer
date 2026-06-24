-- Phase 2 trade portal: in-progress checkout wizard state.
--
-- One row per trade account (account_id is UNIQUE). Holds the buyer's
-- choices as they move from /trade/cart → /trade/checkout/freight →
-- /trade/checkout/review. We keep this on the server (NOT in localStorage
-- or a cookie) so:
--   1. Wizard state survives device switches mid-checkout.
--   2. We don't bloat cookies (ship-to address can be multiple lines).
--   3. Admin tooling can inspect partially-completed checkouts.
--
-- Cleared on successful order submission. A buyer abandoning checkout
-- and coming back the next day keeps their selections.

create table if not exists public.hammerex_trade_checkout_drafts (
  id              uuid primary key default gen_random_uuid(),
  account_id      uuid not null references public.hammerex_trade_accounts(id) on delete cascade,
  freight_mode    text,
  incoterm        text,
  ship_to_address text,
  ship_to_country text,
  customer_notes  text,
  updated_at      timestamptz not null default now(),
  unique (account_id)
);

create index if not exists hammerex_trade_checkout_drafts_account_idx
  on public.hammerex_trade_checkout_drafts (account_id);

alter table public.hammerex_trade_checkout_drafts enable row level security;

-- Service-role only. The portal reads/writes via supabaseAdmin from
-- route handlers — no anon access required.
