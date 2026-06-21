-- Stripe orders table. Captures every Stripe checkout intent + lifecycle.
-- Stays empty until STRIPE_ENABLED feature flag flips on in the app — the
-- table just sits ready, no UI surfaces use it until then.

create table if not exists public.hammerex_orders (
  id uuid primary key default gen_random_uuid(),

  -- Buyer info captured at Stripe Checkout.
  buyer_email      text,
  buyer_name       text,
  buyer_phone      text,
  shipping_address jsonb,

  -- Stripe references (idempotency keys).
  stripe_session_id        text unique,
  stripe_payment_intent_id text,
  stripe_charge_id         text,

  -- Order data snapshot.
  line_items     jsonb not null,
  currency       text not null default 'GBP',
  subtotal_pence integer not null,
  shipping_pence integer not null default 0,
  total_pence    integer not null,

  -- Lifecycle:
  --   pending      → checkout session created, no payment yet
  --   authorized   → card authorized but NOT captured (the buffer)
  --   captured     → money taken (just before dispatch)
  --   dispatched   → tracking link added
  --   delivered    → confirmed delivered (manual or webhook)
  --   refunded     → money returned to buyer
  --   cancelled    → session expired or buyer cancelled
  status        text not null default 'pending',
  authorized_at timestamptz,
  captured_at   timestamptz,
  dispatched_at timestamptz,
  delivered_at  timestamptz,
  refunded_at   timestamptz,
  cancelled_at  timestamptz,
  tracking_url  text,

  -- Lightweight FK to the buyer's preferred channel for updates
  -- (whatsapp / email). Free-text since Stripe will hand us both.
  notify_via text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger hammerex_orders_set_updated_at
  before update on public.hammerex_orders
  for each row execute function public.hammerex_touch_updated_at();

-- Indexes for the admin dispatch dashboard's common queries.
create index if not exists hammerex_orders_status_idx
  on public.hammerex_orders (status, created_at desc);
create index if not exists hammerex_orders_buyer_email_idx
  on public.hammerex_orders (lower(buyer_email));
