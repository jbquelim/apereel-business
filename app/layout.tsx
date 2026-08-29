import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono, Instrument_Serif, Plus_Jakarta_Sans } from "next/font/google";
import { JsonLd } from "@/components/json-ld";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { SkipLink } from "@/components/skip-link";
import { getSiteUrl, site } from "@/lib/site";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

const instrument = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-instrument",
  display: "swap",
});

const ibmPlex = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-ibm-plex",
  display: "swap",
});

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Apereel | Business-First Digital Growth",
    template: "%s | Apereel",
  },
  description: site.supporting,
  keywords: [
    "Apereel",
    "digital growth consultancy",
    "business-first SEO",
    "e-commerce growth",
    "digital advertising",
    "AI-powered web development",
    "conversion optimization",
    "John Lim",
  ],
  authors: [{ name: site.founder.name, url: site.linkedin }],
  creator: site.founder.name,
  publisher: site.name,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_CA",
    url: siteUrl,
    siteName: site.name,
    title: "Apereel | Business-First Digital Growth",
    description: site.supporting,
  },
  twitter: {
    card: "summary_large_image",
    title: "Apereel | Business-First Digital Growth",
    description: site.supporting,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
};

export const viewport: Viewport = {
  themeColor: "#070e1c",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en-CA"
      className={`${plusJakarta.variable} ${instrument.variable} ${ibmPlex.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-navy font-sans text-ink">
        <JsonLd />
        <SkipLink />
        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
