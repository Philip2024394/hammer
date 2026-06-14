import { supabase } from "@/lib/supabase";
import { BRAND, siteUrl, escapeXml } from "@/lib/seo";
import { formatPrice } from "@/lib/fx";

export const revalidate = 3600;

export async function GET() {
  const base = siteUrl();
  const res = await supabase
    .from("hammerex_products")
    .select("id, slug, name, description, subtitle, overview, image_url, price_idr, sku, created_at")
    .order("created_at", { ascending: false })
    .limit(50);

  const products = res.data ?? [];
  const buildDate = new Date().toUTCString();

  const items = products
    .map((p) => {
      const link = `${base}/product/${p.slug ?? p.id}`;
      const summary = p.subtitle ?? p.overview ?? p.description ?? "";
      const ref = p.sku ? `Ref ${p.sku} — ` : "";
      const price = `Indicative price ${formatPrice(p.price_idr, "IDR")}`;
      const desc = `${ref}${summary} ${price}`.trim();
      const pubDate = p.created_at ? new Date(p.created_at).toUTCString() : buildDate;
      const enclosure = p.image_url
        ? `<enclosure url="${escapeXml(p.image_url)}" type="image/jpeg" />`
        : "";
      return `    <item>
      <title>${escapeXml(p.name)}</title>
      <link>${escapeXml(link)}</link>
      <guid isPermaLink="true">${escapeXml(link)}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${escapeXml(desc)}</description>
      ${enclosure}
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(BRAND.name)} — latest products</title>
    <link>${escapeXml(base)}</link>
    <description>${escapeXml(BRAND.description)}</description>
    <language>en-us</language>
    <lastBuildDate>${buildDate}</lastBuildDate>
    <atom:link href="${escapeXml(`${base}/feed.xml`)}" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400"
    }
  });
}
