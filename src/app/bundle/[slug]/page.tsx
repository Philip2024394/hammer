import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { BundleBlock } from "@/components/pdp/BundleBlock";
import { absolute, breadcrumbJsonLd, BRAND } from "@/lib/seo";
import {
  supabase,
  type HammerexBundle,
  type HammerexProduct
} from "@/lib/supabase";
import { formatPrice, type Currency } from "@/lib/fx";
import { bundlePricing } from "@/lib/pricing";
import { BundlePageBackButton } from "@/components/pdp/BundlePageBackButton";

// Bundle page is ISR — bumps every 60s.
export const revalidate = 60;

// `[slug]` is the **anchor product's** slug. The existing PDP loader already
// enforces one bundle per anchor (`.limit(1).maybeSingle()`), so the anchor
// slug is a stable, human-readable URL for the bundle without needing a new
// `slug` column on `hammerex_bundles`.
async function loadBundle(anchorSlug: string) {
  const anchorRes = await supabase
    .from("hammerex_products")
    .select("*")
    .eq("slug", anchorSlug)
    .maybeSingle();
  const anchor = anchorRes.data as HammerexProduct | null;
  if (!anchor) return null;

  const bundleRes = await supabase
    .from("hammerex_bundles")
    .select(
      "*, hammerex_bundle_items(id, qty, sort_order, item:hammerex_products!hammerex_bundle_items_item_product_id_fkey(*))"
    )
    .eq("anchor_product_id", anchor.id)
    .order("sort_order")
    .limit(1)
    .maybeSingle();

  if (!bundleRes.data) return null;
  const b: any = bundleRes.data;
  const bundle: HammerexBundle = {
    id: b.id,
    anchor_product_id: b.anchor_product_id,
    title: b.title,
    discount_pct: b.discount_pct,
    items: (b.hammerex_bundle_items ?? [])
      .sort((x: any, y: any) => x.sort_order - y.sort_order)
      .map((it: any) => ({ id: it.id, qty: it.qty, product: it.item as HammerexProduct }))
  };

  return { anchor, bundle };
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const data = await loadBundle(slug);
  if (!data) return { title: "Bundle not found" };
  const { anchor, bundle } = data;
  const itemNames = bundle.items.map((i) => i.product.name).join(" + ");
  const description = `${bundle.title} — ${itemNames}. Save ${bundle.discount_pct}% when bought together.`;
  const url = absolute(`/bundle/${slug}`);
  return {
    title: `${bundle.title} · Save ${bundle.discount_pct}%`,
    description,
    alternates: { canonical: `/bundle/${slug}` },
    openGraph: {
      type: "website",
      title: bundle.title,
      description,
      url,
      siteName: BRAND.name,
      images: anchor.image_url ? [{ url: anchor.image_url, alt: bundle.title }] : []
    },
    twitter: {
      card: "summary_large_image",
      title: bundle.title,
      description,
      images: anchor.image_url ? [anchor.image_url] : []
    }
  };
}

export default async function BundlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await loadBundle(slug);
  if (!data) notFound();
  const { anchor, bundle } = data;

  // Pre-compute the all-items-selected totals for the hero summary card —
  // the picker inside BundleBlock recomputes live as the buyer toggles items.
  const { original, final, savings } = bundlePricing(
    bundle.items.map((i) => i.product.price_idr * i.qty),
    bundle.discount_pct
  );
  // Honour the anchor product's base currency so a GBP-priced bundle doesn't
  // surprise the buyer by suddenly displaying in IDR.
  const currency: Currency = (anchor.base_currency as Currency | undefined) ?? "IDR";

  const breadcrumb = breadcrumbJsonLd([
    { name: "Home", url: "/" },
    { name: "Bundles", url: "/bundles" },
    { name: bundle.title, url: `/bundle/${slug}` }
  ]);

  return (
    <main>
      <Header />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />

      <div className="mx-auto max-w-6xl px-4 pt-4">
        <BundlePageBackButton
          fallbackHref={`/product/${anchor.slug ?? anchor.id}`}
          fallbackLabel={anchor.name}
        />
      </div>

      <nav className="mx-auto max-w-6xl px-4 pt-4 text-xs text-brand-muted" aria-label="Breadcrumb">
        <ol className="flex items-center gap-2">
          <li><a href="/" className="hover:text-brand-text">Hammerex</a></li>
          <li>/</li>
          <li><a href={`/product/${anchor.slug ?? anchor.id}`} className="hover:text-brand-text">{anchor.name}</a></li>
          <li>/</li>
          <li className="text-brand-text">Bundle</li>
        </ol>
      </nav>

      <section className="mx-auto max-w-6xl px-4 pt-6">
        <div className="rounded-2xl border-2 border-brand-accent bg-black p-5 sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex-1">
              <span className="inline-block rounded-full bg-brand-accent px-3 py-1 text-xs font-bold uppercase tracking-widest text-black">
                Bundle &amp; save {bundle.discount_pct}%
              </span>
              <h1 className="mt-3 text-2xl font-bold leading-tight text-brand-text sm:text-3xl">
                {bundle.title}
              </h1>
              <p className="mt-2 text-sm text-brand-muted">
                {bundle.items.length} items · saves {formatPrice(savings, currency)} versus buying separately.{" "}
                <a href={`/product/${anchor.slug ?? anchor.id}`} className="text-brand-accent hover:underline">
                  See the main product →
                </a>
              </p>
            </div>
            <div className="shrink-0 rounded-xl border border-brand-line bg-brand-surface px-4 py-3 text-right">
              <div className="text-xs text-brand-muted">Original</div>
              <div className="text-sm text-brand-muted line-through">{formatPrice(original, currency)}</div>
              <div className="mt-1 text-xs text-brand-muted">Bundle price</div>
              <div className="text-xl font-bold text-brand-text">{formatPrice(final, currency)}</div>
            </div>
          </div>
        </div>
      </section>

      <BundleBlock bundle={bundle} currency={currency} />
    </main>
  );
}
