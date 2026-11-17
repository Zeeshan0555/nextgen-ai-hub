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

type RssItem = {
  title?: string;
  link?: string;
  pubDate?: string;
};

type RssResponse = {
  items?: RssItem[];
};

export type PublicHeadline = {
  id: string;
  title: string;
  category: string;
  source: string;
  readTime: string;
  publishedAt: string;
  image: string;
  publisherUrl: string;
  summary: string;
  fullReport: string[];
  bullets: string[];
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

export async function getPublicHeadlines(): Promise<PublicHeadline[]> {
  try {
    const feedResults = await Promise.all(NEWS_FEEDS.map(fetchFeed));
    const incoming: PublicHeadline[] = [];

    for (const { feed, items } of feedResults) {
      for (const item of items.slice(0, 12)) {
        const title = cleanHeadline(item.title);
        const publishedAt = parseFeedDate(item.pubDate);
        const publisherUrl = safePublisherUrl(item.link, feed.allowedHosts);

        if (
          title.length < 12 ||
          !publishedAt ||
          Date.parse(publishedAt) > Date.now() + 24 * 60 * 60 * 1000 ||
          !publisherUrl ||
          !headlineMatchesFeed(title, feed)
        ) continue;

        incoming.push({
          id: title,
          title,
          category: feed.category,
          source: feed.publisher,
          readTime: "Source link",
          publishedAt,
          image: "",
          publisherUrl,
          summary: "Original report from " + feed.publisher + ". Open the publisher link for the full details.",
          fullReport: [],
          bullets: ["Headline only. Open the original source for the complete report."],
        });
      }
    }

    const unique: PublicHeadline[] = [];
    for (const candidate of incoming) {
      if (unique.some((existing) =>
        normalizeHeadline(existing.title) === normalizeHeadline(candidate.title) ||
        isNearDuplicate(existing.title, candidate.title)
      )) continue;
      unique.push(candidate);
    }

    return unique.sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt));
  } catch (error) {
    console.error("Server headline collection failed:", error);
    return [];
  }
}
