import type { MetadataRoute } from "next";

// Only the public pages. Dashboards, admin and guest table pages stay out of search.
export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://dastak.food";
  return [
    { url: `${base}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/privacy`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/terms`, changeFrequency: "yearly", priority: 0.3 },
  ];
}
