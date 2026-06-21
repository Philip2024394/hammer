import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { DeliveryFooter } from "@/components/DeliveryFooter";
import { supabase, type HammerexGuide, type HammerexProduct } from "@/lib/supabase";
import { absolute, articleJsonLd, breadcrumbJsonLd, BRAND, faqJsonLd } from "@/lib/seo";
import { renderMarkdown } from "@/lib/mdRender";
import { formatPrice } from "@/lib/fx";

export const revalidate = 300;

async function loadGuide(slug: string) {
  const guideRes = await supabase
    .from("hammerex_guides")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();
  const guide = guideRes.data as HammerexGuide | null;
  if (!guide) return null;

  let related: HammerexProduct[] = [];
  if (guide.related_product_slugs && guide.related_product_slugs.length > 0) {
    const productsRes = await supabase
      .from("hammerex_products")
      .select("*")
      .in("slug", guide.related_product_slugs);
    related = (productsRes.data ?? []) as HammerexProduct[];
    // Preserve the author's chosen order.
    const order = new Map(guide.related_product_slugs.map((s, i) => [s, i]));
    related.sort((a, b) => (order.get(a.slug ?? "") ?? 99) - (order.get(b.slug ?? "") ?? 99));
  }

  return { guide, related };
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const res = await supabase
    .from("hammerex_guides")
    .select("title, slug, meta_description, hero_image_url")
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();
  const g = res.data;
  if (!g) return { title: "Guide not found" };

  const image = g.hero_image_url ?? BRAND.logo;
  const url = absolute(`/guides/${g.slug}`);

  return {
    title: `${g.title} — Hammerex`,
    description: g.meta_description,
    alternates: { canonical: `/guides/${g.slug}` },
    openGraph: {
      type: "article",
      title: g.title,
      description: g.meta_description,
      url,
      siteName: BRAND.name,
      images: [{ url: image, alt: g.title }]
    },
    twitter: {
      card: "summary_large_image",
      title: g.title,
      description: g.meta_description,
      images: [image]
    }
  };
}

export default async function GuideDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await loadGuide(slug);
  if (!data) notFound();
  const { guide, related } = data;

  const breadcrumb = breadcrumbJsonLd([
    { name: "Home", url: "/" },
    { name: "Guides", url: "/guides" },
    { name: guide.title, url: `/guides/${guide.slug}` }
  ]);

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd(guide)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
      {guide.faq && guide.faq.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(guide.faq)) }}
        />
      )}
      <Header />

      <nav className="mx-auto max-w-3xl px-4 pt-4 text-xs text-brand-muted" aria-label="Breadcrumb">
        <ol className="flex items-center gap-2">
          <li><a href="/" className="hover:text-brand-text">Hammerex</a></li>
          <li>/</li>
          <li><a href="/guides" className="hover:text-brand-text">Guides</a></li>
          <li>/</li>
          <li className="text-brand-text">{guide.title}</li>
        </ol>
      </nav>

      <article className="mx-auto max-w-3xl px-4 pt-6 pb-10">
        <p className="text-xs font-bold uppercase tracking-widest text-brand-accent">
          Hammerex Guide
        </p>
        <h1 className="mt-3 text-3xl font-bold leading-tight text-brand-text sm:text-4xl">
          {guide.title}
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-brand-muted">{guide.intro}</p>

        {guide.hero_image_url && (
          <figure className="mt-6 overflow-hidden rounded-2xl border border-brand-line bg-black">
            {/* Natural aspect, full height — no forced 16:9 crop so portrait
                or square artwork shows in full, not letterboxed. */}
            <img
              src={guide.hero_image_url}
              alt={guide.title}
              loading="lazy"
              decoding="async"
              className="block h-auto w-full"
            />
          </figure>
        )}

        <div className="mt-2">{renderMarkdown(guide.body_md)}</div>
      </article>

      {related.length > 0 && (
        <section className="border-t border-brand-line py-10">
          <div className="mx-auto max-w-5xl px-4">
            <h2 className="text-sm font-bold uppercase tracking-widest text-brand-accent">
              Mentioned in this guide
            </h2>
            <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {related.map((p) => {
                const cur = (p.base_currency ?? "IDR") as "IDR" | "USD" | "SGD" | "AUD" | "EUR" | "GBP";
                return (
                  <li key={p.id}>
                    <a
                      href={`/product/${p.slug ?? p.id}`}
                      className="group flex h-full flex-col overflow-hidden rounded-xl border border-brand-line bg-brand-surface transition hover:border-brand-accent"
                    >
                      <div className="aspect-square w-full overflow-hidden bg-black">
                        {p.image_url && (
                          <img
                            src={p.image_url}
                            alt={p.name}
                            loading="lazy"
                            decoding="async"
                            className="h-full w-full object-contain"
                          />
                        )}
                      </div>
                      <div className="flex flex-1 flex-col p-3">
                        <span className="line-clamp-2 text-xs font-semibold text-brand-text group-hover:text-brand-accent">
                          {p.name}
                        </span>
                        <span className="mt-auto pt-2 text-sm font-bold text-brand-accent">
                          {formatPrice(p.price_idr, cur)}
                        </span>
                      </div>
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>
      )}

      {guide.faq && guide.faq.length > 0 && (
        <section className="border-t border-brand-line py-10">
          <div className="mx-auto max-w-3xl px-4">
            <h2 className="mb-2 text-lg font-semibold text-brand-text">Frequently asked</h2>
            <p className="mb-6 text-xs text-brand-muted">
              The questions buyers ask about this topic.
            </p>
            <div className="flex flex-col gap-3">
              {guide.faq.map((f, i) => (
                <details
                  key={i}
                  className="group rounded-2xl border border-brand-line bg-brand-surface p-4 open:bg-brand-bg"
                >
                  <summary className="flex cursor-pointer list-none items-start justify-between gap-3 text-sm font-semibold text-brand-text">
                    <span>{f.q}</span>
                    <span
                      aria-hidden="true"
                      className="mt-0.5 inline-block shrink-0 rounded-full bg-brand-accent/15 px-2 text-xs font-bold text-brand-accent transition group-open:rotate-45"
                    >
                      +
                    </span>
                  </summary>
                  <p className="mt-3 text-xs leading-relaxed text-brand-muted">{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      )}

      <DeliveryFooter />
    </main>
  );
}
