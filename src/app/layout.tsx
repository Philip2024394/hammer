import type { Metadata, Viewport } from "next";
import { cookies, headers } from "next/headers";
import "./globals.css";
import { BRAND, SEO_KEYWORDS, siteUrl, organizationJsonLd, websiteJsonLd } from "@/lib/seo";
import { CompareDock } from "@/components/CompareDock";
import { TradeTipFooter } from "@/components/TradeTipFooter";
import { WelcomePopup } from "@/components/WelcomePopup";
import { GeoBridge } from "@/components/GeoBridge";
import { CountryProvider } from "@/components/CountryProvider";
import { LocaleProvider } from "@/components/LocaleProvider";
import { getCountryFromRequest } from "@/lib/geo";
import { getLocale } from "@/lib/i18n/server";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#000000",
  colorScheme: "dark"
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: `${BRAND.name} — ${BRAND.tagline}`,
    template: `%s | ${BRAND.name}`
  },
  description: BRAND.description,
  applicationName: BRAND.name,
  authors: [{ name: BRAND.name }],
  creator: BRAND.name,
  publisher: BRAND.name,
  category: "Construction & Tools",
  keywords: SEO_KEYWORDS,
  alternates: {
    canonical: "/",
    types: {
      "application/rss+xml": [{ url: "/feed.xml", title: `${BRAND.name} — latest products` }]
    }
  },
  openGraph: {
    type: "website",
    siteName: BRAND.name,
    title: `${BRAND.name} — ${BRAND.tagline}`,
    description: BRAND.description,
    url: siteUrl(),
    locale: BRAND.locale,
    images: [{ url: BRAND.logo, width: 1200, height: 1200, alt: `${BRAND.name} logo` }]
  },
  twitter: {
    card: "summary_large_image",
    title: `${BRAND.name} — ${BRAND.tagline}`,
    description: BRAND.description,
    images: [BRAND.logo]
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1
    }
  },
  icons: {
    icon: BRAND.logo,
    shortcut: BRAND.logo,
    apple: BRAND.logo
  }
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const country = getCountryFromRequest(await headers(), await cookies());
  const locale = await getLocale();
  return (
    <html lang={locale}>
      <body className="min-h-screen bg-brand-bg pb-[calc(56px+env(safe-area-inset-bottom))] text-brand-text antialiased md:pb-0">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd()) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd()) }}
        />
        <CountryProvider country={country}>
          <LocaleProvider locale={locale}>
            {children}
            <GeoBridge />
            <TradeTipFooter />
            <CompareDock />
            <WelcomePopup />
          </LocaleProvider>
        </CountryProvider>
      </body>
    </html>
  );
}
