import NeuroWirePlatform, { type NewsCategory, type NewsItem } from "@/app/components/NeuroWirePlatform";
import { createSupabaseServerClient } from "@/app/lib/supabase-server";
import { getPublicHeadlines } from "@/app/lib/public-news";

export const dynamic = "force-dynamic";

const ALLOWED_CATEGORIES = new Set<NewsCategory>([
  "AI",
  "Crypto",
  "Policy",
  "Technology",
  "Fox News",
  "Leadership",
]);

const LEGACY_FEED_PUBLISHERS = new Set([
  "techcrunch",
  "cointelegraph",
  "the verge",
  "ars technica",
  "fox news",
  "harvard business review",
]);

function getSourceUrlFromContent(value: unknown): string {
  if (typeof value !== "string") return "";
  const line = value.split("\n").find((item) => item.startsWith("ORIGINAL_SOURCE_URL:"));
  if (!line) return "";
  const url = line.slice("ORIGINAL_SOURCE_URL:".length).trim();
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" ? parsed.toString() : "";
  } catch {
    return "";
  }
}

function mapStoredStory(item: Record<string, unknown>): NewsItem | null {
  const title = typeof item.title === "string" ? item.title.trim() : "";
  const source = typeof item.source === "string" ? item.source.trim() : "Source not provided";
  const category = typeof item.category === "string" && ALLOWED_CATEGORIES.has(item.category as NewsCategory)
    ? item.category as NewsCategory
    : "Uncategorized";
  const content = typeof item.content === "string" ? item.content : "";
  const isReviewedBriefing = content.startsWith("NEUROWIRE_EDITORIAL_BRIEF_V1");

  // Private encrypted Author drafts must never appear in public news.
  if (content.startsWith("NEUROWIRE_PRIVATE_AUTHOR_DRAFT_V1\\n")) return null;

  // Older automated RSS copies are not republished after the source-policy change.
  if (LEGACY_FEED_PUBLISHERS.has(source.toLocaleLowerCase()) && !isReviewedBriefing) {
    return null;
  }
  if (!title) return null;

  const publishedAt = typeof item.created_at === "string" ? item.created_at : "";
  const displayContent = content.split("\n").filter((line) => !line.startsWith("NEUROWIRE_") && !line.startsWith("ORIGINAL_SOURCE_URL:")).join("\n").trim();
  const contentWords = displayContent.trim().split(/\s+/).filter(Boolean).length;

  return {
    id: String(item.id ?? title),
    title,
    category,
    source,
    readTime: content.startsWith("NEUROWIRE_SOURCE_LINK_V1")
      ? "Source link"
      : String(Math.max(1, Math.ceil(contentWords / 200))) + " min read",
    publishedAt,
    image: content.startsWith("NEUROWIRE_SOURCE_LINK_V1")
      ? ""
      : typeof item.image_url === "string" ? item.image_url : "",
    publisherUrl: getSourceUrlFromContent(content),
    summary: typeof item.description === "string" && item.description.trim()
      ? item.description.trim()
      : title,
    fullReport: displayContent ? displayContent.split("\n\n") : [title],
    bullets: isReviewedBriefing
      ? ["AI-assisted briefing reviewed by the NeuroWire Admin; check the original source for complete context."]
      : ["NeuroWire has not independently verified every statement in the original publisher report."],
  };
}

export default async function HomePage() {
  const stories: NewsItem[] = [];

  // Database stories are optional for the public homepage. A temporary database
  // issue must not stop the official headline feed from rendering.
  try {
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase
      .from("news")
      .select("id, title, category, source, description, content, image_url, created_at")
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) {
      console.error("Server homepage news query failed:", error.message);
    } else if (Array.isArray(data)) {
      for (const row of data) {
        const story = mapStoredStory(row as Record<string, unknown>);
        if (story) stories.push(story);
      }
    }
  } catch (error) {
    console.warn("Server-side stored news is unavailable:", error instanceof Error ? error.message : "Unknown error");
  }

  const liveHeadlines = await getPublicHeadlines();
  for (const headline of liveHeadlines) {
    const matching = stories.find((story) =>
      story.title.trim().toLocaleLowerCase() === headline.title.trim().toLocaleLowerCase()
    );

    if (matching) {
      if (!matching.publisherUrl) matching.publisherUrl = headline.publisherUrl;
    } else {
      stories.push(headline as NewsItem);
    }
  }

  stories.sort((left, right) => {
    const leftTime = Date.parse(left.publishedAt);
    const rightTime = Date.parse(right.publishedAt);
    return (Number.isFinite(rightTime) ? rightTime : 0) -
      (Number.isFinite(leftTime) ? leftTime : 0);
  });

  return <NeuroWirePlatform initialNews={stories} />;
}
