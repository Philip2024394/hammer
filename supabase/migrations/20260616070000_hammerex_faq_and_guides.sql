-- SEO content infrastructure: per-product FAQ (curated, editorial) and a
-- hammerex_guides table for the long-form /guides hub. Both drive
-- FAQPage JSON-LD rendered at the page level. Distinct from the existing
-- hammerex_questions table which holds user-submitted Q&A.

alter table public.hammerex_products
  add column if not exists faq jsonb default '[]'::jsonb;

-- FAQ jsonb shape: [{"q": "Question text?", "a": "Answer text."}, ...]
-- Empty array means the PDP renders no FAQ section.

create table if not exists public.hammerex_guides (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  meta_description text not null,
  intro text not null,
  body_md text not null,
  hero_image_url text,
  faq jsonb default '[]'::jsonb,
  related_product_slugs text[] default '{}',
  published boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists hammerex_guides_published_idx
  on public.hammerex_guides (published, slug);

alter table public.hammerex_guides enable row level security;

drop policy if exists "public read published guides" on public.hammerex_guides;
create policy "public read published guides" on public.hammerex_guides
  for select using (published = true);
