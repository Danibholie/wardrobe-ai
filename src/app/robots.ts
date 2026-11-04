import type { MetadataRoute } from "next";
import { SITE_CONFIG } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = SITE_CONFIG.url;

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/signin"],
        disallow: ["/api/", "/home", "/plan", "/wardrobe", "/admin", "/_next/"],
      },
      {
        userAgent: "Googlebot",
        allow: ["/", "/signin"],
        disallow: ["/api/", "/home", "/plan", "/wardrobe", "/admin"],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
