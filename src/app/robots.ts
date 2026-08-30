import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.next-template.dev";

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/dashboard/", "/api/"], // Protect private routes from crawling
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
