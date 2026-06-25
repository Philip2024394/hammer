import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { supabase, type HammerexTradeOffListing } from "@/lib/supabase";
import { XratedHeader } from "@/components/xrated/XratedHeader";
import { XratedFooter } from "@/components/xrated/XratedFooter";
import { PremiumHero } from "@/components/xrated/profile/PremiumHero";
import { ReviewFormPanel } from "@/components/xrated/profile/ReviewFormPanel";
import { tradeLabel, whatsappQuoteUrl } from "@/lib/tradeOff";

export const revalidate = 60;

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
  if (!listing) return { title: "Leave a review" };
  const primary = tradeLabel(listing.primary_trade);
  return {
    title: `Leave a review for ${listing.display_name} — ${primary} | Xrated Trades`,
    description: `Share your experience working with ${listing.display_name} on Xrated Trades. Honest reviews protect good tradespeople and help customers choose.`
  };
}

export default async function TradeReviewPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const listing = await loadListing(slug);
  if (!listing) notFound();

  const primary = tradeLabel(listing.primary_trade);
  const waUrl = whatsappQuoteUrl(listing.whatsapp, listing.display_name, primary);

  return (
    <main className="flex flex-1 flex-col pb-20 md:pb-0">
      <XratedHeader />

      <PremiumHero listing={listing} waUrl={waUrl} currentPage="contact" />

      <ReviewFormPanel
        listingId={listing.id}
        displayName={listing.display_name}
      />

      <div className="mt-auto">
        <XratedFooter />
      </div>
    </main>
  );
}
