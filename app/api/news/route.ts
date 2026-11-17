import { NextResponse } from "next/server";
import {
  NEWS_FEEDS,
  cleanHeadline,
  headlineMatchesFeed,
  normalizeHeadline,
  parseFeedDate,
  rssToJsonUrl,
  safePublisherUrl,
  type NewsFeed,
} from "@/app/lib/news-sources";

export const dynamic = "force-dynamic";

type RssItem = {
  title?: string;
  link?: string;
  pubDate?: string;
};

type RssResponse = {
  items?: RssItem[];
};

type HeadlineItem = {
  title: string;
  description: string;
  content: string;
  image_url: string;
  created_at: string;
  source: string;
  category: string;
  publisher_url: string;
};

async function fetchFeed(feed: NewsFeed): Promise<{ feed: NewsFeed; items: RssItem[] }> {
  try {
    const response = await fetch(rssToJsonUrl(feed.rssUrl), {
      next: { revalidate: 900 },
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) return { feed, items: [] };
    const payload: unknown = await response.json();
    if (!payload || typeof payload !== "object") return { feed, items: [] };
    const items = (payload as RssResponse).items;
    return { feed, items: Array.isArray(items) ? items : [] };
  } catch {
    return { feed, items: [] };
  }
}

function isNearDuplicate(left: string, right: string): boolean {
  const leftWords = new Set(normalizeHeadline(left).split(" ").filter((word) => word.length > 2));
  const rightWords = new Set(normalizeHeadline(right).split(" ").filter((word) => word.length > 2));
  if (leftWords.size < 6 || rightWords.size < 6) return false;
  const overlap = [...leftWords].filter((word) => rightWords.has(word)).length;
  const union = new Set([...leftWords, ...rightWords]).size;
  return union > 0 && overlap / union >= 0.86;
}

export async function GET() {
  try {
    const feedResults = await Promise.all(NEWS_FEEDS.map(fetchFeed));
    const incoming: HeadlineItem[] = [];

    for (const { feed, items } of feedResults) {
      for (const item of items.slice(0, 12)) {
        const title = cleanHeadline(item.title);
        const publishedAt = parseFeedDate(item.pubDate);
        const publisherUrl = safePublisherUrl(item.link, feed.allowedHosts);

        // Display a headline only when the source, date and direct HTTPS link are usable.
        if (
          title.length < 12 ||
          !publishedAt ||
          Date.parse(publishedAt) > Date.now() + 24 * 60 * 60 * 1000 ||
          !publisherUrl ||
          !headlineMatchesFeed(title, feed)
        ) continue;

        incoming.push({
          title,
          description: "Original report from " + feed.publisher + ". Open the publisher link for the full details.",
          content: "",
          image_url: "",
          created_at: publishedAt,
          source: feed.publisher,
          category: feed.category,
          publisher_url: publisherUrl,
        });
      }
    }

    // Exact and near-duplicate headlines are removed before the mixed latest feed is sorted.
    const unique: HeadlineItem[] = [];
    for (const candidate of incoming) {
      if (unique.some((existing) =>
        normalizeHeadline(existing.title) === normalizeHeadline(candidate.title) ||
        isNearDuplicate(existing.title, candidate.title)
      )) continue;
      unique.push(candidate);
    }
    unique.sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at));

    return NextResponse.json(
      {
        success: true,
        count: unique.length,
        news: unique,
      },
      { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" } }
    );
  } catch (error) {
    console.error("Public headline feed failed:", error);
    // Keep the public page calm and useful; technical details stay in server logs/Admin.
    return NextResponse.json(
      { success: true, count: 0, news: [] },
      { headers: { "Cache-Control": "no-store" } }
    );
  }
}
