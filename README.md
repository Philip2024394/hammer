# Hammerex Products

Black-themed product storefront. Next.js 15 + Tailwind + Supabase.

Shares the indocity Supabase project (`krbewsrfxjswkoosohyc`). All tables are prefixed `hammerex_` so they live alongside citydrivers / cityriders / beautician / etc. without collision.

## Run

```bash
npm install
npm run dev
```

App runs at http://localhost:3007.

## Apply DB migration

The migration creates `hammerex_categories` + `hammerex_products` with public read RLS and seed rows.

```bash
# from this folder, after `supabase link --project-ref krbewsrfxjswkoosohyc`
npx supabase db push
```

Or paste `supabase/migrations/20260610000000_hammerex_init.sql` into the Supabase SQL editor.

## Layout

- Header: brand left, search center, cart right
- Hero image
- Category carousel (horizontal scroll)
- 3 featured product cards
- Footer: 2 international-delivery cards
