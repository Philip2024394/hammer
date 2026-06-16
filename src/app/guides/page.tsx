import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { DeliveryFooter } from "@/components/DeliveryFooter";
import { supabase, type HammerexGuide } from "@/lib/supabase";
import { BRAND } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Guides — Hammerex",
  description:
    "Hammerex buyer guides — choosing pruning shears, picking the right tool bag, understanding 1680D fabric, EMS shipping times. Honest answers, written by the team.",
  alternates: { canonical: "/guides" },
  openGraph: {
    type: "website",
    title: `Guides | ${BRAND.name}`,
    description:
      "Hammerex buyer guides — choosing tools, understanding materials, EMS shipping. Honest answers from the team.",
    url: "/guides",
    siteName: BRAND.name
  }
};

export default async function GuidesIndexPage() {
  const res = await supabase
    .from("hammerex_guides")
    .select("*")
    .eq("published", true)
    .order("created_at", { ascending: false });
  const guides = (res.data ?? []) as HammerexGuide[];

  return (
    <main>
      <Header />
      <section className="mx-auto max-w-3xl px-4 pt-10 pb-6">
        <p className="text-xs font-bold uppercase tracking-widest text-brand-accent">
          Hammerex Guides
        </p>
        <h1 className="mt-3 text-3xl font-bold leading-tight text-brand-text sm:text-4xl">
          Honest answers from the workshop.
        </h1>
        <p className="mt-2 text-sm text-brand-muted">
          Buyer questions, material explanations and trade-tested advice — written so you
          can pick the right tool the first time.
        </p>
      </section>

      <section className="mx-auto max-w-5xl px-4 pb-16">
        {guides.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-brand-line bg-brand-surface p-10 text-center text-sm text-brand-muted">
            New guides land here weekly. Check back soon.
          </div>
        ) : (
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {guides.map((g) => (
              <li key={g.id}>
                <a
                  href={`/guides/${g.slug}`}
                  className="group flex h-full flex-col overflow-hidden rounded-2xl border border-brand-line bg-brand-surface transition hover:border-brand-accent"
                >
                  {g.hero_image_url && (
                    <div className="aspect-[16/9] w-full overflow-hidden bg-black">
                      <img
                        src={g.hero_image_url}
                        alt={g.title}
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-cover transition group-hover:scale-[1.02]"
                      />
                    </div>
                  )}
                  <div className="flex flex-1 flex-col p-5">
                    <h2 className="text-base font-semibold text-brand-text group-hover:text-brand-accent">
                      {g.title}
                    </h2>
                    <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-brand-muted">
                      {g.intro}
                    </p>
                    <span className="mt-4 text-xs font-bold uppercase tracking-widest text-brand-accent">
                      Read guide →
                    </span>
                  </div>
                </a>
              </li>
            ))}
          </ul>
        )}
      </section>

      <DeliveryFooter />
    </main>
  );
}
