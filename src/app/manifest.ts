import type { MetadataRoute } from "next";
import { BRAND } from "@/lib/seo";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${BRAND.name} — ${BRAND.tagline}`,
    short_name: BRAND.name,
    description: BRAND.description,
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#000000",
    theme_color: "#000000",
    lang: "en-GB",
    categories: ["shopping", "business", "productivity"],
    icons: [
      { src: BRAND.logo, sizes: "192x192", type: "image/png", purpose: "any" },
      { src: BRAND.logo, sizes: "512x512", type: "image/png", purpose: "any" },
      { src: BRAND.logo, sizes: "512x512", type: "image/png", purpose: "maskable" }
    ]
  };
}
