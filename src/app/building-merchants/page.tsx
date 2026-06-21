import type { Metadata } from "next";
import { SeoLandingPage, landingMetadata } from "@/components/SeoLandingPage";

export const revalidate = 3600;
export const metadata: Metadata = landingMetadata("building-merchants");

export default async function Page() {
  return <SeoLandingPage landingKey="building-merchants" />;
}
