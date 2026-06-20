-- Add a real `updated_at` column to hammerex_products with an auto-update
-- trigger, so the public sitemap can surface accurate freshness signals
-- to Google instead of falling back to created_at on every row.
--
-- Backfill = created_at so existing rows still produce a valid lastModified
-- on the next sitemap build.

alter table public.hammerex_products
  add column if not exists updated_at timestamptz not null default now();

update public.hammerex_products
  set updated_at = coalesce(updated_at, created_at, now())
  where updated_at is null;

-- Reusable trigger function: stamps updated_at on every row write.
-- Lives in public so the same function can be reused on any table that
-- wants the same behaviour (e.g. hammerex_categories later).
create or replace function public.hammerex_touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists hammerex_products_set_updated_at on public.hammerex_products;
create trigger hammerex_products_set_updated_at
  before update on public.hammerex_products
  for each row execute function public.hammerex_touch_updated_at();
