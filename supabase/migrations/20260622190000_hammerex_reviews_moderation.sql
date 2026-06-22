-- Review moderation. Public can now insert via /api/reviews (server-side
-- using service role), but only `approved` rows render on the PDP. The
-- PDP query is updated in code to filter status='approved'; old rows
-- (none after the prior truncate) would have been backfilled to
-- 'approved' by the conditional update below so nothing silently
-- disappears if the truncate ever gets reverted.
--
-- We deliberately do NOT add a public-insert RLS policy. Submissions go
-- through the server route which uses the service-role key, so we keep
-- the table locked down against direct anon writes.

alter table public.hammerex_reviews
  add column if not exists status text not null default 'pending'
    check (status in ('pending','approved','rejected')),
  add column if not exists reviewer_whatsapp text,
  add column if not exists reviewer_country  text,
  add column if not exists reviewed_at       timestamptz;

-- If any legacy rows exist (shouldn't, the table was truncated), keep
-- them visible by marking them approved so the PDP doesn't regress.
update public.hammerex_reviews set status = 'approved' where status = 'pending' and reviewer_whatsapp is null;

create index if not exists hammerex_reviews_status_idx
  on public.hammerex_reviews (product_id, status, created_at desc);
create index if not exists hammerex_reviews_pending_idx
  on public.hammerex_reviews (status, created_at desc)
  where status = 'pending';
