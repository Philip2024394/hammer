-- Schedule the review date refresh to run every 3 days, keeping the visible
-- created_at values within the last 4 months without any app code involvement.

create extension if not exists pg_cron;

-- Recomputes created_at for every review using a stable per-id slot in the
-- last 120 days. Order stays the same; dates always look recent.
create or replace function public.hammerex_refresh_review_dates()
returns void
language plpgsql
security definer
as $$
begin
  with indexed as (
    select id, row_number() over (order by id) as rn from public.hammerex_reviews
  )
  update public.hammerex_reviews r
  set created_at = now() - (interval '1 minute' * (
    (i.rn * 663 + (abs(hashtext(r.id::text)) % 663))::bigint
  ))
  from indexed i
  where i.id = r.id;
end;
$$;

-- Re-schedule idempotently: remove any prior job of the same name first.
do $$
begin
  perform cron.unschedule('hammerex-refresh-review-dates');
exception when others then
  -- No prior job — fine, ignore.
  null;
end $$;

-- Every 3rd day at 03:00 UTC.
select cron.schedule(
  'hammerex-refresh-review-dates',
  '0 3 */3 * *',
  $$ select public.hammerex_refresh_review_dates(); $$
);
