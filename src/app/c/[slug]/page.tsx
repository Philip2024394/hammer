import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { ProductRow } from "@/components/ProductRow";
import { DeliveryFooter } from "@/components/DeliveryFooter";
import { WelcomeTrigger } from "@/components/WelcomeTrigger";
import { supabase, type HammerexCategory, type HammerexProduct } from "@/lib/supabase";
import { absolute, breadcrumbJsonLd, collectionJsonLd, BRAND } from "@/lib/seo";

export const dynamic = "force-dynamic";

async function loadCategory(slug: string) {
  const catRes = await supabase
    .from("hammerex_categories")
    .select("id, slug, name, image_url, sort_order, is_tool_type")
    .eq("slug", slug)
    .maybeSingle();
  const category = catRes.data as HammerexCategory | null;
  if (!category) return null;

  const allCatsRes = await supabase
    .from("hammerex_categories")
    .select("id, slug, name");
  const catsById = new Map<string, { slug: string; name: string }>();
  for (const c of (allCatsRes.data ?? [])) {
    catsById.set(c.id, { slug: c.slug, name: c.name });
  }
  const stampCategory = (p: HammerexProduct): HammerexProduct => ({
    ...p,
    category: p.category_id ? catsById.get(p.category_id) ?? null : null
  });

  const products: HammerexProduct[] = [];
  const seen = new Set<string>();

  if (category.is_tool_type) {
    // Tool-type category: pull every product linked via the junction table.
    const tradesRes = await supabase
      .from("hammerex_product_trades")
      .select("sort_order, product:hammerex_products(*)")
      .eq("category_id", category.id)
      .order("sort_order");
    const rows = ((tradesRes.data ?? []) as unknown as Array<{ product: HammerexProduct | null }>)
      .map((r) => r.product)
      .filter((p): p is HammerexProduct => Boolean(p))
      .map(stampCategory);
    for (const p of rows) {
      if (seen.has(p.id)) continue;
      seen.add(p.id);
      products.push(p);
    }
  } else {
    // Trade category: include products where primary category matches, OR
    // is_universal=true, OR cross-listed via hammerex_product_trades. To
    // keep the category-page identity clean (so the chips never read like
    // a foreign trade), every card's category chip is overridden to the
    // current page's category. That solves the prior "Scaffolding cards
    // showing on Carpentry" complaint while still letting one product
    // genuinely belong to several trades (e.g. an adjustable-pliers
    // belt holder is cross-listed to plumbing + electrical + hvac + ...).
    const stampToCurrent = (p: HammerexProduct): HammerexProduct => ({
      ...p,
      category: { slug: category.slug, name: category.name }
    });

    const [primaryRes, universalRes, crossRes] = await Promise.all([
      supabase
        .from("hammerex_products")
        .select("*")
        .eq("category_id", category.id)
        .order("home_sort_order", { ascending: true })
        .order("price_idr", { ascending: false }),
      supabase
        .from("hammerex_products")
        .select("*")
        .eq("is_universal", true)
        .neq("category_id", category.id)
        .order("home_sort_order", { ascending: true }),
      supabase
        .from("hammerex_product_trades")
        .select("sort_order, product:hammerex_products(*)")
        .eq("category_id", category.id)
        .order("sort_order")
    ]);
    const primary = ((primaryRes.data ?? []) as HammerexProduct[]).map(stampToCurrent);
    const universal = ((universalRes.data ?? []) as HammerexProduct[]).map(stampToCurrent);
    const cross = ((crossRes.data ?? []) as unknown as Array<{ product: HammerexProduct | null }>)
      .map((r) => r.product)
      .filter((p): p is HammerexProduct => Boolean(p))
      .map(stampToCurrent);
    for (const p of [...primary, ...universal, ...cross]) {
      if (seen.has(p.id)) continue;
      seen.add(p.id);
      products.push(p);
    }
  }

  return { category, products };
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const res = await supabase
    .from("hammerex_categories")
    .select("name, slug, image_url")
    .eq("slug", slug)
    .maybeSingle();
  const cat = res.data;
  if (!cat) return { title: "Category not found" };

  const title = `${cat.name}`;
  const description = `${cat.name} tools and supplies from ${BRAND.name}. International freight by sea or air, quoted in your local currency.`;
  const image = cat.image_url ?? BRAND.logo;
  const url = absolute(`/c/${cat.slug ?? slug}`);

  return {
    title,
    description,
    alternates: { canonical: `/c/${cat.slug ?? slug}` },
    openGraph: {
      type: "website",
      title: `${title} | ${BRAND.name}`,
      description,
      url,
      siteName: BRAND.name,
      images: [{ url: image, alt: `${cat.name} — ${BRAND.name}` }]
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${BRAND.name}`,
      description,
      images: [image]
    }
  };
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await loadCategory(slug);
  if (!data) notFound();

  const { category, products } = data;
  const breadcrumb = breadcrumbJsonLd([
    { name: "Home", url: "/" },
    { name: category.name, url: `/c/${category.slug}` }
  ]);
  const collection = collectionJsonLd(category, products);

  return (
    <main>
      <WelcomeTrigger />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collection) }}
      />
      <Header />
      <section className="mx-auto max-w-6xl px-4 pt-8">
        <nav className="text-xs text-brand-muted">
          <a href="/" className="hover:text-brand-accent">Home</a>
          <span className="mx-2">/</span>
          <span className="text-brand-text">{category.name}</span>
        </nav>
        <h1 className="mt-3 text-2xl font-bold uppercase tracking-wide text-brand-text sm:text-3xl">
          {category.name}
        </h1>
        <p className="mt-2 text-sm text-brand-muted">
          {products.length === 0
            ? "No products listed under this trade yet — check back soon."
            : `${products.length} product${products.length === 1 ? "" : "s"} for ${category.name.toLowerCase()}.`}
        </p>
      </section>

      {products.length > 0 && <ProductRow items={products} hideHeader />}

      <DeliveryFooter />
    </main>
  );
}
