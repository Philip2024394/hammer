// Supabase Storage image transform helper. For URLs hosted on the
// Hammerex Supabase project's product-images bucket, rewrite the path
// from `/object/public/...` to `/render/image/public/...?width=...&resize=contain&quality=...`
// so the CDN serves a resized version that preserves the aspect ratio.
// Pass-through for non-Supabase URLs.
//
// CRITICAL: `resize=contain` is required. Supabase's render endpoint
// defaults to `resize=cover`, which keeps the source height and CROPS
// the width — slicing visible content (e.g. banner text) off the left
// and right. `contain` scales width and height proportionally.
export function imageUrl(url: string | null | undefined, width = 800, quality = 90): string | null {
  if (!url) return null;

  const STORAGE_PATH = "/storage/v1/object/public/";
  const RENDER_PATH = "/storage/v1/render/image/public/";

  if (url.includes(STORAGE_PATH)) {
    const transformed = url.replace(STORAGE_PATH, RENDER_PATH);
    const sep = transformed.includes("?") ? "&" : "?";
    return `${transformed}${sep}width=${width}&resize=contain&quality=${quality}`;
  }

  return url;
}
