import { MetadataRoute } from "next";

const SITE_URL = "https://neurowire-news.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  const staticPages = [
    { path: "", priority: 1, changeFrequency: "hourly" as const },
    { path: "/about", priority: 0.5, changeFrequency: "monthly" as const },
    { path: "/editorial-policy", priority: 0.5, changeFrequency: "monthly" as const },
    { path: "/ai-disclosure", priority: 0.5, changeFrequency: "monthly" as const },
    { path: "/privacy", priority: 0.3, changeFrequency: "yearly" as const },
  ];

  return staticPages.map((page) => ({
    url: `${SITE_URL}${page.path}`,
    lastModified,
    changeFrequency: page.changeFrequency,
    priority: page.priority,
  }));
}
