# Hammerex Products

Black-themed product storefront. Next.js 15 + Tailwind + Supabase.

**Dedicated Supabase project:** `msdonkkechxzgagyguoe` (region `ap-northeast-1`). All tables are prefixed `hammerex_` and product imagery lives in the public `product-images` Storage bucket. The app reads exclusively from this project — it has no shared dependencies with any other system.

## Run

```bash
npm install
npm run dev
```

App runs at http://localhost:3007.

## Apply DB migration

The migration creates `hammerex_categories` + `hammerex_products` with public read RLS and seed rows.

```bash
# from this folder, after `supabase link --project-ref msdonkkechxzgagyguoe`
npx supabase db push
```

Or paste `supabase/migrations/20260610000000_hammerex_init.sql` into the Supabase SQL editor.

## Image hosting

Product imagery and brand assets are stored in the dedicated project's `product-images` Storage bucket (public-read). The `imageUrl()` helper in `src/lib/imageUrl.ts` rewrites the storage URL to Supabase's image transform endpoint (`/storage/v1/render/image/public/...?width=N&quality=N`). Hardcoded image URLs in components (logo, hero banners, etc.) also live in the same bucket under `migrated/<sha1>.png`.

To migrate any future ImageKit URLs, the resumable scripts in `scripts/` (`migrate_images.mjs`, `migrate_code_images.mjs`, `rewrite_urls.mjs`) handle download/upload/DB rewrite. Credentials read from `.env.tools.local` (gitignored).

## Layout

- Header: brand left, search center, cart right
- Hero image
- Category carousel (horizontal scroll)
- 3 featured product cards
- Footer: 2 international-delivery cards
