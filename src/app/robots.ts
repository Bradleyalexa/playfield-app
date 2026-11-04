import type { MetadataRoute } from "next";
import { seoConfig } from "../config/seo.config";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = seoConfig.siteUrl;

  const privateDisallows = [
    "/api/",
    "/host/",
    "/kiosk/",
    "/live/",
    "/analytics",
    "/mailbox",
  ];

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: privateDisallows,
      },
      {
        userAgent: [
          "GPTBot",
          "ChatGPT-User",
          "ClaudeBot",
          "anthropic-ai",
          "Claude-Web",
          "Google-Extended",
          "PerplexityBot",
          "Applebot-Extended",
        ],
        allow: "/",
        disallow: privateDisallows,
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
