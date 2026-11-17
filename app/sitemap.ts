import { MetadataRoute } from "next";
import { createSupabaseServerClient } from "@/app/lib/supabase-server";

export const revalidate = 3600;

const SITE_URL = "https://neurowire-news.vercel.app";
const BRIEFING_MARKER = "NEUROWIRE_EDITORIAL_BRIEF_V1";
const REQUIRED_SECTIONS = [
  "## What happened",
  "## Key details",
  "## Why it matters",
  "## What the source does not tell us",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date();
  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified, changeFrequency: "hourly", priority: 1 },
    { url: SITE_URL + "/about", lastModified, changeFrequency: "monthly", priority: 0.5 },
    { url: SITE_URL + "/editorial-policy", lastModified, changeFrequency: "monthly", priority: 0.5 },
    { url: SITE_URL + "/ai-disclosure", lastModified, changeFrequency: "monthly", priority: 0.5 },
    { url: SITE_URL + "/privacy", lastModified, changeFrequency: "yearly", priority: 0.3 },
  ];

  try {
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase
      .from("news")
      .select("title, created_at, content")
      .order("created_at", { ascending: false })
      .limit(500);

    if (error || !Array.isArray(data)) return staticPages;

    const articlePages: MetadataRoute.Sitemap = data
      .filter((item) => {
        const content = typeof item.content === "string" ? item.content : "";
        return (
          typeof item.title === "string" &&
          item.title.trim().length > 0 &&
          content.startsWith(BRIEFING_MARKER) &&
          content.length >= 500 &&
          REQUIRED_SECTIONS.every((section) => content.includes(section))
        );
      })
      .map((item) => ({
        url: SITE_URL + "/news/" + encodeURIComponent(item.title),
        lastModified:
          typeof item.created_at === "string" && !Number.isNaN(Date.parse(item.created_at))
            ? new Date(item.created_at)
            : lastModified,
        changeFrequency: "weekly" as const,
        priority: 0.65,
      }));

    return [...staticPages, ...articlePages];
  } catch {
    return staticPages;
  }
}
