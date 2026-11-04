import { seoConfig } from "../config/seo.config";

export function generateWebApplicationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: seoConfig.siteName,
    url: seoConfig.siteUrl,
    applicationCategory: "SportsApplication",
    operatingSystem: "All (Web Browser)",
    browserRequirements: "Requires JavaScript. Requires HTML5.",
    description: seoConfig.description,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "IDR",
    },
    featureList: [
      "Smart WhatsApp list parser",
      "Rotasi pertandingan ganda seimbang (Badminton, Padel, Tennis, Pickleball)",
      "Mode TV GOR Kiosk full-screen display",
      "Live spectator scoreboard & match status",
      "Kalkulator split bill & tracker shuttlecock/bola",
    ],
    screenshot: `${seoConfig.siteUrl}/playfield_banner.png`,
  };
}

export function generateOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: seoConfig.siteName,
    url: seoConfig.siteUrl,
    logo: `${seoConfig.siteUrl}/Playfield_icon.png`,
    description: seoConfig.description,
    sameAs: Object.values(seoConfig.social),
  };
}

export function generateWebsiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: seoConfig.siteName,
    url: seoConfig.siteUrl,
    description: seoConfig.description,
  };
}

export function generateBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function generateFAQSchema(
  faqs: Array<{ question: string; answer: string }>,
  pageUrl: string = `${seoConfig.siteUrl}/faq`
) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${pageUrl}#faq`,
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

export function generateHowToSchema(
  steps: Array<{ step: number; title: string; description: string }>,
  pageUrl: string = `${seoConfig.siteUrl}/cara-pakai`
) {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "@id": `${pageUrl}#howto`,
    name: "Panduan Cara Mengatur Mabar Olahraga dengan Playfield",
    description:
      "Panduan langkah demi langkah menggunakan Playfield untuk rotasi lapangan, smart WhatsApp list parsing, display TV GOR, dan split bill otomatis.",
    totalTime: "PT5M",
    step: steps.map((s) => ({
      "@type": "HowToStep",
      position: s.step,
      name: s.title,
      text: s.description,
      url: `${pageUrl}#langkah-${s.step}`,
    })),
  };
}

