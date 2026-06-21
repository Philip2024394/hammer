import type { Metadata } from "next";
import { SeoLandingPage, landingMetadata } from "@/components/SeoLandingPage";

export const revalidate = 3600;
export const metadata: Metadata = landingMetadata("hardware-store-direct");

export default async function Page() {
  return <SeoLandingPage landingKey="hardware-store-direct" />;
}
