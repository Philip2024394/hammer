import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { supabase, type HammerexTradeOffListing } from "@/lib/supabase";
import { XratedHeader } from "@/components/xrated/XratedHeader";
import { XratedFooter } from "@/components/xrated/XratedFooter";
import { PremiumHero } from "@/components/xrated/profile/PremiumHero";
import { FaqAccordion } from "@/components/xrated/profile/FaqAccordion";
import { TrustAndLogisticsPanel } from "@/components/xrated/profile/TrustAndLogisticsPanel";
import { OfficeHoursMarquee } from "@/components/xrated/profile/OfficeHoursMarquee";
import { ContactFormPanel } from "@/components/xrated/profile/ContactFormPanel";
import { tradeLabel, whatsappQuoteUrl } from "@/lib/tradeOff";

export const revalidate = 300;

async function loadListing(slug: string): Promise<HammerexTradeOffListing | null> {
  const res = await supabase
    .from("hammerex_trade_off_listings")
    .select("*")
    .eq("slug", slug)
    .eq("status", "live")
    .maybeSingle();
  return (res.data ?? null) as HammerexTradeOffListing | null;
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const listing = await loadListing(slug);
  if (!listing) return { title: "Contact" };
  const primary = tradeLabel(listing.primary_trade);
  return {
    title: `Contact ${listing.display_name} — ${primary} in ${listing.city} | Xrated Trades`,
    description: `Send ${listing.display_name} a message about your ${primary.toLowerCase()} job. Reply by email or WhatsApp.`
  };
}

export default async function TradeContactPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const listing = await loadListing(slug);
  if (!listing) notFound();

  const primary = tradeLabel(listing.primary_trade);
  const hasFaq = (listing.faq_items?.length ?? 0) > 0;
  const waUrl = whatsappQuoteUrl(listing.whatsapp, listing.display_name, primary);

  return (
    <main className="flex flex-1 flex-col pb-20 md:pb-0">
      <XratedHeader />

      {/* Always-on hero + stats — same identity strip the customer sees on
          the public profile, so they never lose context on sub-pages. */}
      <PremiumHero listing={listing} waUrl={waUrl} currentPage="contact" />

      {/* FAQ FIRST — let the customer self-serve before they message.
          Back-to-profile is already covered by the yellow "Home page"
          button in the PremiumHero CTA row. */}
      {hasFaq && (
        <section className="w-full px-4 pt-2 sm:px-6">
          <OfficeHoursMarquee hours={listing.operating_hours ?? null} />
          <FaqAccordion items={listing.faq_items} themeColor="#FFB300" />
        </section>
      )}

      {/* Full "What to know before you message" trust panel — surfaces
          insurance £ cover, qualifications, memberships, DBS / transport
          / tools / free-quote flags, years-in-trade and minimum job
          right before the form. Hero already shows the headline trust
          badges; this is the detailed breakdown. */}
      <TrustAndLogisticsPanel listing={listing} />

      {/* CONTACT FORM — supports Email OR WhatsApp send. */}
      <ContactFormPanel
        listingId={listing.id}
        displayName={listing.display_name}
        themeColor="#FFB300"
        whatsapp={listing.whatsapp}
      />

      <div className="mt-auto">
        <XratedFooter />
      </div>
    </main>
  );
}
