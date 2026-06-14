// Supabase Storage image transform helper. For URLs hosted on the
// Hammerex Supabase project's product-images bucket, rewrite the path
// from `/object/public/...` to `/render/image/public/...?width=...&quality=...`
// so the CDN serves a resized version. Pass-through for non-Supabase URLs.
export function imageUrl(url: string | null | undefined, width = 800, quality = 90): string | null {
  if (!url) return null;

  const STORAGE_PATH = "/storage/v1/object/public/";
  const RENDER_PATH = "/storage/v1/render/image/public/";

  if (url.includes(STORAGE_PATH)) {
    const transformed = url.replace(STORAGE_PATH, RENDER_PATH);
    const sep = transformed.includes("?") ? "&" : "?";
    return `${transformed}${sep}width=${width}&quality=${quality}`;
  }

  return url;
}
