import type { MetadataRoute } from "next";
import { createSupabaseServerClient } from "@/app/lib/supabase-server";
import { isIndexableEditorialArticle } from "@/app/lib/article-quality";

export const revalidate = 3600;

const SITE_URL = "https://neurowire-news.vercel.app";
const PAGE_SIZE = 500;

const staticPages: MetadataRoute.Sitemap = [
  { url: SITE_URL, changeFrequency: "hourly", priority: 1 },
  { url: SITE_URL + "/about", changeFrequency: "monthly", priority: 0.5 },
  { url: SITE_URL + "/editorial-policy", changeFrequency: "monthly", priority: 0.5 },
  { url: SITE_URL + "/ai-disclosure", changeFrequency: "monthly", priority: 0.5 },
  { url: SITE_URL + "/privacy", changeFrequency: "yearly", priority: 0.3 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    const supabase = createSupabaseServerClient();
    const articleByUrl = new Map<string, MetadataRoute.Sitemap[number]>();

    // Read every page of records. A fixed first-page limit can silently omit
    // older eligible articles as the newsroom grows.
    for (let offset = 0; ; offset += PAGE_SIZE) {
      const { data, error } = await supabase
        .from("news")
        .select("title, created_at, content, description, source")
        .order("created_at", { ascending: false })
        .order("title", { ascending: true })
        .range(offset, offset + PAGE_SIZE - 1);

      if (error || !Array.isArray(data)) {
        console.error("Sitemap article lookup failed:", error?.message || "Invalid response");
        return staticPages;
      }

      for (const item of data) {
        if (!isIndexableEditorialArticle(item) || typeof item.title !== "string") continue;

        const url = SITE_URL + "/news/" + encodeURIComponent(item.title);
        if (articleByUrl.has(url)) continue;

        const lastModified =
          typeof item.created_at === "string" && !Number.isNaN(Date.parse(item.created_at))
            ? new Date(item.created_at)
            : undefined;

        articleByUrl.set(url, {
          url,
          ...(lastModified ? { lastModified } : {}),
          changeFrequency: "weekly",
          priority: 0.65,
        });
      }

      if (data.length < PAGE_SIZE) break;
    }

    return [...staticPages, ...articleByUrl.values()];
  } catch (error) {
    console.error(
      "Sitemap generation failed:",
      error instanceof Error ? error.message : "Unknown error"
    );
    return staticPages;
  }
}
