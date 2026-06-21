import type { Metadata } from "next";
import { SeoLandingPage, landingMetadata } from "@/components/SeoLandingPage";

export const revalidate = 3600;
export const metadata: Metadata = landingMetadata("hand-tools");

export default async function Page() {
  return <SeoLandingPage landingKey="hand-tools" />;
}
