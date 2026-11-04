import type { Metadata } from "next";
import { Space_Grotesk, JetBrains_Mono, Outfit } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { seoConfig } from "../config/seo.config";
import { generateWebApplicationSchema, generateOrganizationSchema, generateWebsiteSchema } from "../lib/structured-data";
import { StructuredData } from "../components/common/StructuredData";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["500", "700", "800"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["600", "800", "900"],
});

export const metadata: Metadata = {
  metadataBase: new URL(seoConfig.siteUrl),
  title: {
    default: `${seoConfig.siteName} — ${seoConfig.tagline}`,
    template: `%s | ${seoConfig.siteName}`,
  },
  description: seoConfig.description,
  applicationName: seoConfig.siteName,
  authors: [{ name: seoConfig.author.name, url: seoConfig.siteUrl }],
  creator: seoConfig.author.name,
  publisher: seoConfig.author.name,
  keywords: [...seoConfig.primaryKeywords],
  openGraph: {
    title: `${seoConfig.siteName} — ${seoConfig.tagline}`,
    description: seoConfig.description,
    url: seoConfig.siteUrl,
    siteName: seoConfig.siteName,
    locale: "id_ID",
    type: "website",
    images: [
      {
        url: "/playfield_banner.png",
        width: 920,
        height: 320,
        alt: `${seoConfig.siteName} — ${seoConfig.tagline}`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${seoConfig.siteName} — ${seoConfig.tagline}`,
    description: seoConfig.description,
    images: ["/playfield_banner.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/Playfield_icon.png", type: "image/png" },
    ],
    apple: "/apple-icon.png",
    shortcut: "/Playfield_icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${spaceGrotesk.variable} ${jetbrainsMono.variable} ${outfit.variable} h-full antialiased`}
    >
      <head>
        <StructuredData data={generateWebApplicationSchema()} />
        <StructuredData data={generateOrganizationSchema()} />
        <StructuredData data={generateWebsiteSchema()} />
      </head>
      <body className="min-h-full flex flex-col bg-[#faf8f2] text-[#0a0a0a] font-sans selection:bg-[#ccff00] selection:text-black">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
