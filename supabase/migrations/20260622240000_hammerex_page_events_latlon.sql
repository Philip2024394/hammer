-- Capture lat/lon on every page event so the live-presence map at
-- /admin/world can pin sessions geographically. Vercel populates
-- x-vercel-ip-latitude / x-vercel-ip-longitude on every request;
-- Cloudflare doesn't send coordinates on free/Pro. When missing, the
-- admin page falls back to plotting at the country centroid.

alter table public.hammerex_page_events
  add column if not exists latitude  numeric,
  add column if not exists longitude numeric;

create index if not exists hammerex_page_events_latlon_idx
  on public.hammerex_page_events (latitude, longitude)
  where latitude is not null and longitude is not null;
