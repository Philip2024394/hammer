import type { Metadata } from "next";
import { SeoLandingPage, landingMetadata } from "@/components/SeoLandingPage";

export const revalidate = 3600;
export const metadata: Metadata = landingMetadata("scaffolding-tool-belts-uk");

export default async function Page() {
  return <SeoLandingPage landingKey="scaffolding-tool-belts-uk" />;
}
