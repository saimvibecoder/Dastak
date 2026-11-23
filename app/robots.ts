import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/app/", "/admin/", "/auth/", "/api/", "/verify", "/r/"] },
    sitemap: "https://dastak.food/sitemap.xml",
    host: "https://dastak.food",
  };
}
