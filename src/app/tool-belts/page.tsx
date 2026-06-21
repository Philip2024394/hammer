import type { Metadata } from "next";
import { SeoLandingPage, landingMetadata } from "@/components/SeoLandingPage";

export const revalidate = 3600;
export const metadata: Metadata = landingMetadata("tool-belts");

export default async function Page() {
  return <SeoLandingPage landingKey="tool-belts" />;
}
