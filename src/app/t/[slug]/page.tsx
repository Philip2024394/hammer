// Legacy `/t/<slug>` route — permanently redirects to the canonical
// `/trade/<slug>` profile URL. Kept around so existing bookmarks, social
// shares, QR codes, and search-engine indexes continue to resolve cleanly
// after the rename.

import { permanentRedirect } from "next/navigation";

export default async function LegacyTradieRedirect({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  permanentRedirect(`/trade/${slug}`);
}
