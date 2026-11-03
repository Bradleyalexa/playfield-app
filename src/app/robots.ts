import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = "https://www.playfield.fit";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/host/",
          "/kiosk/",
          "/live/",
          "/analytics",
          "/mailbox",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
