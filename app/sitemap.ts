import { MetadataRoute } from "next";
import { createSupabaseServerClient } from "@/app/lib/supabase-server";
import { isIndexableEditorialArticle } from "@/app/lib/article-quality";

export const revalidate = 3600;

const SITE_URL = "https://neurowire-news.vercel.app";

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
      .select("title, created_at, content, description, source")
      .order("created_at", { ascending: false })
      .limit(500);

    if (error || !Array.isArray(data)) return staticPages;

    const articlePages: MetadataRoute.Sitemap = data
      .filter((item) => isIndexableEditorialArticle(item))
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
