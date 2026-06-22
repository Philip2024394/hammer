-- Capture city + region (state/subdivision) on every page event so the
-- admin can break down traffic below country level. Vercel populates
-- x-vercel-ip-city and x-vercel-ip-country-region on every request;
-- Cloudflare populates cf-ipcity only on Enterprise. Local dev sends
-- nothing, so dev rows stay NULL — that's expected.

alter table public.hammerex_page_events
  add column if not exists city   text,
  add column if not exists region text;

create index if not exists hammerex_page_events_city_idx
  on public.hammerex_page_events (city)
  where city is not null;
