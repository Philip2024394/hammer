-- "Submit your project" / out-of-stock product-request inbox. Distinct
-- from hammerex_quote_requests (which captures a cart snapshot at
-- /checkout). This table captures bespoke / custom / out-of-stock
-- enquiries from ProductRequestModal: quantity + free-text project
-- details, no cart. Pending → admin replies by email/phone → flips
-- to 'responded' / 'closed'.
--
-- Same RLS model as quote-requests: locked down, server-side writes
-- only via the service-role key.

create table if not exists public.hammerex_product_requests (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique,       -- short P-XXXXXX code shown to the buyer
  buyer_name text not null,
  buyer_email text not null,
  buyer_phone text not null,
  buyer_country text not null,
  quantity text not null,               -- text, accepts "1" / "50" / "500+"
  details text not null,                -- free-form project description
  status text not null default 'pending'
    check (status in ('pending','responded','closed')),
  admin_notes text,
  responded_at timestamptz,
  closed_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists hammerex_product_requests_status_idx
  on public.hammerex_product_requests (status, created_at desc);
create index if not exists hammerex_product_requests_pending_idx
  on public.hammerex_product_requests (created_at desc)
  where status = 'pending';

alter table public.hammerex_product_requests enable row level security;
