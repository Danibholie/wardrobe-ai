import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXTAUTH_URL || "https://lbd-wardrobe-ai.netlify.app";
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/home", "/plan", "/wardrobe"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
