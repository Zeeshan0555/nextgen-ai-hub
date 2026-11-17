import { NextResponse } from "next/server";

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
  allowedHosts: string[];
};

const FEEDS: FeedConfig[] = [
  {
    url: "https://api.rss2json.com/v1/api.json?rss_url=https://techcrunch.com/category/artificial-intelligence/feed/",
    publisher: "TechCrunch",
    allowedHosts: ["techcrunch.com"],
    category: "AI",
  },
  {
    url: "https://api.rss2json.com/v1/api.json?rss_url=https://www.theverge.com/rss/ai-artificial-intelligence/index.xml",
    publisher: "The Verge",
    allowedHosts: ["theverge.com"],
    category: "AI",
  },
  {
    url: "https://api.rss2json.com/v1/api.json?rss_url=https://cointelegraph.com/rss",
    publisher: "CoinTelegraph",
    allowedHosts: ["cointelegraph.com"],
    category: "Crypto",
  },
  {
    url: "https://api.rss2json.com/v1/api.json?rss_url=https://www.theverge.com/rss/policy/index.xml",
    publisher: "The Verge",
    allowedHosts: ["theverge.com"],
    category: "Policy",
  },
  {
    url: "https://api.rss2json.com/v1/api.json?rss_url=https://feeds.arstechnica.com/arstechnica/tech-policy",
    publisher: "Ars Technica",
    allowedHosts: ["arstechnica.com"],
    category: "Policy",
  },
  {
    url: "https://api.rss2json.com/v1/api.json?rss_url=https://www.theverge.com/rss/tech/index.xml",
    publisher: "The Verge",
    allowedHosts: ["theverge.com"],
    category: "Technology",
  },
  {
    url: "https://api.rss2json.com/v1/api.json?rss_url=https://feeds.arstechnica.com/arstechnica/index",
    publisher: "Ars Technica",
    allowedHosts: ["arstechnica.com"],
    category: "Technology",
  },
  {
    url: "https://api.rss2json.com/v1/api.json?rss_url=https://moxie.foxnews.com/google-publisher/latest.xml",
    publisher: "Fox News",
    allowedHosts: ["foxnews.com"],
    category: "Fox News",
  },
  {
    url: "https://api.rss2json.com/v1/api.json?rss_url=https://feeds.hbr.org/harvardbusiness",
    publisher: "Harvard Business Review",
    allowedHosts: ["hbr.org"],
    category: "Leadership",
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

function getSafePublisherUrl(value: unknown, allowedHosts: string[]): string {
  if (typeof value !== "string" || !value.trim()) return "";

  try {
    const parsed = new URL(value.trim());
    const host = parsed.hostname.toLocaleLowerCase();
    const allowed = allowedHosts.some((domain) => host === domain || host.endsWith("." + domain));
    return parsed.protocol === "https:" && allowed ? parsed.toString() : "";
  } catch {
    return "";
  }
}

const CATEGORY_SIGNALS: Record<string, string[]> = {
  AI: ["artificial intelligence", "machine learning", "generative ai", "large language model", "language model", "chatgpt", "openai", "anthropic", "gemini", "ai model", "ai agent", "neural network"],
  Crypto: ["bitcoin", "ethereum", "crypto", "cryptocurrency", "blockchain", "web3", "defi", "digital asset", "token", "stablecoin", "solana"],
  Policy: ["policy", "regulation", "regulatory", "legislation", "lawmakers", "government", "parliament", "congress", "privacy law", "antitrust", "court ruling", "data protection"],
  Technology: ["technology", "tech", "software", "smartphone", "computer", "semiconductor", "chip", "cybersecurity", "robotics", "spacecraft", "app", "operating system"],
  Leadership: ["leadership", "chief executive", "ceo", "founder", "executive", "management", "board of directors", "business strategy", "workplace culture", "decision-making"],
};

function isCategoryRelevant(category: string, title: string, articleText: string): boolean {
  // Fox News is a publisher-based section, not a general topic classifier.
  if (category === "Fox News") return true;
  const text = `${title} ${articleText.slice(0, 1800)}`.toLocaleLowerCase();
  return (CATEGORY_SIGNALS[category] || []).some((signal) => text.includes(signal));
}

function normalizedTitle(value: string): string {
  return value.toLocaleLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function areNearDuplicateTitles(left: string, right: string): boolean {
  const leftWords = new Set(normalizedTitle(left).split(" ").filter((word) => word.length > 2));
  const rightWords = new Set(normalizedTitle(right).split(" ").filter((word) => word.length > 2));
  if (leftWords.size < 6 || rightWords.size < 6) return false;
  const intersection = [...leftWords].filter((word) => rightWords.has(word)).length;
  const union = new Set([...leftWords, ...rightWords]).size;
  return union > 0 && intersection / union >= 0.86;
}

async function fetchRss(url: string): Promise<RssResponse | null> {
  try {
    const response = await fetch(url, { next: { revalidate: 900 }, signal: AbortSignal.timeout(10000) });
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
      for (const item of (data?.items || []).slice(0, 8)) {
        const title = cleanFeedText(item.title);
        const articleText = cleanFeedText(item.content || item.description);
        const publishedAt = parsePublishedAt(item.pubDate);

        // Keep useful, dated publisher items; do not fabricate missing text or dates.
        if (!title || title.length < 12 || !publishedAt || articleText.length < 40) continue;
        if (Date.parse(publishedAt) > Date.now() + 24 * 60 * 60 * 1000) continue;
        if (!isCategoryRelevant(feed.category, title, articleText)) continue;

        const publisherUrl = getSafePublisherUrl(item.link, feed.allowedHosts);
        if (!publisherUrl) continue;
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

    // Remove exact and near-duplicate headlines while preserving publisher attribution.
    const uniqueIncoming: typeof incoming = [];
    for (const candidate of incoming) {
      if (uniqueIncoming.some((existing) =>
        normalizedTitle(existing.title) === normalizedTitle(candidate.title) ||
        areNearDuplicateTitles(existing.title, candidate.title)
      )) continue;
      uniqueIncoming.push(candidate);
    }
    uniqueIncoming.sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at));

    // This endpoint is public and is used by article readers. It only returns
    // publisher feed data; database writes belong to the protected cron/admin routes.

    return NextResponse.json({
      success: true,
      count: uniqueIncoming.length,
      // Return the source link with each read-only feed item.
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
