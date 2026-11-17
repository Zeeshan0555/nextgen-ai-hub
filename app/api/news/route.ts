import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "../../lib/supabase-server";

export const dynamic = "force-dynamic";

type RssItem = {
  title?: string;
  link?: string;
  description?: string;
  content?: string;
  thumbnail?: string;
  enclosure?: { link?: string };
  pubDate?: string;
};

type RssResponse = {
  items?: RssItem[];
};

type FeedConfig = {
  url: string;
  publisher: string;
  category: string;
};

const FEEDS: FeedConfig[] = [
  {
    url: "https://api.rss2json.com/v1/api.json?rss_url=https://cointelegraph.com/rss",
    publisher: "CoinTelegraph",
    category: "Crypto",
  },
  {
    url: "https://api.rss2json.com/v1/api.json?rss_url=https://techcrunch.com/category/artificial-intelligence/feed/",
    publisher: "TechCrunch",
    category: "AI",
  },
];

function cleanFeedText(value: unknown): string {
  if (typeof value !== "string") return "";

  return value
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;|&#160;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/\s+/g, " ")
    .trim();
}

function limitWords(value: string, maximumWords: number): string {
  const words = value.trim().split(/\s+/).filter(Boolean);
  if (words.length <= maximumWords) return value.trim();
  return `${words.slice(0, maximumWords).join(" ")}…`;
}

function parsePublishedAt(value?: string): string | null {
  if (!value) return null;

  const timestamp = new Date(value);
  if (Number.isNaN(timestamp.getTime())) return null;

  return timestamp.toISOString();
}

function getImageUrl(...values: unknown[]): string {
  for (const value of values) {
    if (typeof value !== "string" || !value.trim()) continue;

    try {
      const parsed = new URL(value.trim());
      if (parsed.protocol === "https:" || parsed.protocol === "http:") {
        return parsed.toString();
      }
    } catch {
      // Ignore malformed image URLs and let the UI use its normal fallback.
    }
  }

  return "";
}

function getSafePublisherUrl(value: unknown): string {
  if (typeof value !== "string" || !value.trim()) return "";

  try {
    const parsed = new URL(value.trim());
    return parsed.protocol === "https:" ? parsed.toString() : "";
  } catch {
    return "";
  }
}

async function fetchRss(url: string): Promise<RssResponse | null> {
  try {
    const response = await fetch(url, { next: { revalidate: 900 } });
    if (!response.ok) return null;

    const payload: unknown = await response.json();
    if (!payload || typeof payload !== "object") return null;

    const items = (payload as RssResponse).items;
    return Array.isArray(items) ? { items } : null;
  } catch {
    return null;
  }
}

export async function GET() {
  try {
    const feedResults = await Promise.all(
      FEEDS.map(async (feed) => ({
        feed,
        data: await fetchRss(feed.url),
      }))
    );

    if (feedResults.every(({ data }) => data === null)) {
      return NextResponse.json(
        { success: false, error: "News feeds are currently unavailable." },
        { status: 502 }
      );
    }

    const publisherUrls = new Map<string, string>();
    const incoming: Array<{
      title: string;
      description: string;
      content: string;
      image_url: string;
      created_at: string;
      source: string;
      category: string;
    }> = [];

    for (const { feed, data } of feedResults) {
      for (const item of (data?.items || []).slice(0, 3)) {
        const title = cleanFeedText(item.title);
        const articleText = cleanFeedText(item.content || item.description);
        const publishedAt = parsePublishedAt(item.pubDate);

        // Do not invent a publication time when the feed does not provide one.
        if (!title || !publishedAt) continue;

        const publisherUrl = getSafePublisherUrl(item.link);
        if (publisherUrl) {
          publisherUrls.set(
            `${feed.publisher.toLocaleLowerCase()}:${title.toLocaleLowerCase()}`,
            publisherUrl
          );
        }

        // Keep a readable publisher excerpt; readers can open the source for the complete story.
        const summaryText = articleText ? limitWords(articleText, 150) : "";
        const description = summaryText || "Open the original publisher article for more details.";

        incoming.push({
          title,
          description,
          // Keep only text supplied by the publisher's RSS item.
          content: summaryText,
          image_url: getImageUrl(item.thumbnail, item.enclosure?.link),
          created_at: publishedAt,
          source: feed.publisher,
          category: feed.category,
        });
      }
    }

    // Avoid sending duplicate titles from the same polling cycle.
    const uniqueIncoming = Array.from(
      new Map(incoming.map((item) => [item.title.toLocaleLowerCase(), item])).values()
    );

    const supabase = createSupabaseServerClient();

    if (uniqueIncoming.length > 0) {
      const { error } = await supabase
        .from("news")
        .upsert(uniqueIncoming, {
          onConflict: "title_key",
          ignoreDuplicates: true,
        });

      if (error) {
        console.error("News upsert error:", error.message);
      }
    }

    return NextResponse.json({
      success: true,
      count: uniqueIncoming.length,
      // Return publisher links to readers without adding unknown columns to the database upsert.
      news: uniqueIncoming.map((item) => ({
        ...item,
        publisher_url:
          publisherUrls.get(`${item.source.toLocaleLowerCase()}:${item.title.toLocaleLowerCase()}`) || "",
      })),
    });
  } catch (error) {
    console.error("News API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
