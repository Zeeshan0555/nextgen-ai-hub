import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "../../../lib/supabase-server";
import { createEditorialBriefing, formatEditorialBriefing, formatSourceExcerpt } from "../../../lib/gemini-editorial";

export const maxDuration = 60;

type RssItem = {
  title?: string;
  description?: string;
  content?: string;
  thumbnail?: string;
  enclosure?: { link?: string };
  pubDate?: string;
  link?: string;
};

type RssResponse = {
  items?: RssItem[];
};

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

const CATEGORY_SIGNALS: Record<string, string[]> = {
  AI: ["artificial intelligence", "machine learning", "generative ai", "language model", "chatgpt", "openai", "anthropic", "gemini", "ai model", "ai agent"],
  Crypto: ["bitcoin", "ethereum", "crypto", "cryptocurrency", "blockchain", "web3", "defi", "digital asset", "stablecoin", "solana"],
  Policy: ["policy", "regulation", "regulatory", "legislation", "lawmakers", "government", "parliament", "congress", "privacy law", "antitrust", "data protection"],
  Technology: ["technology", "tech", "software", "smartphone", "computer", "semiconductor", "chip", "cybersecurity", "robotics", "spacecraft", "operating system"],
  Leadership: ["leadership", "chief executive", "ceo", "founder", "executive", "management", "board of directors", "business strategy", "workplace culture"],
};

function isCategoryRelevant(category: string, title: string, articleText: string): boolean {
  if (category === "Fox News") return true;
  const text = `${title} ${articleText.slice(0, 1800)}`.toLocaleLowerCase();
  return (CATEGORY_SIGNALS[category] || []).some((signal) => text.includes(signal));
}

function parsePublishedAt(value?: string): string | null {
  if (!value) return null;

  const timestamp = new Date(value);
  if (Number.isNaN(timestamp.getTime())) return null;

  return timestamp.toISOString();
}

function getSafePublisherUrl(value: unknown, publisher: string): string {
  if (typeof value !== "string" || !value.trim()) return "";
  const publisherHosts: Record<string, string[]> = {
    "TechCrunch": ["techcrunch.com"],
    "The Verge": ["theverge.com"],
    "CoinTelegraph": ["cointelegraph.com"],
    "Ars Technica": ["arstechnica.com"],
    "Fox News": ["foxnews.com"],
    "Harvard Business Review": ["hbr.org"],
  };
  try {
    const parsed = new URL(value.trim());
    const host = parsed.hostname.toLocaleLowerCase();
    const allowed = (publisherHosts[publisher] || []).some((domain) => host === domain || host.endsWith("." + domain));
    return parsed.protocol === "https:" && allowed ? parsed.toString() : "";
  } catch {
    return "";
  }
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
      // Ignore malformed URLs; the UI can use its normal fallback.
    }
  }

  return "";
}

function isAuthorizedCronRequest(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  const authorization = request.headers.get("authorization");

  if (!secret || secret.length < 32 || !authorization) return false;

  const expected = Buffer.from(`Bearer ${secret}`);
  const received = Buffer.from(authorization);

  return (
    received.length === expected.length &&
    timingSafeEqual(received, expected)
  );
}

export async function GET(request: Request) {
  if (!process.env.CRON_SECRET || process.env.CRON_SECRET.length < 32) {
    return NextResponse.json(
      { success: false, message: "Scheduled publishing is not configured." },
      { status: 503, headers: { "Cache-Control": "no-store" } }
    );
  }

  if (!isAuthorizedCronRequest(request)) {
    return NextResponse.json(
      { success: false, message: "Unauthorized scheduled publishing request." },
      { status: 401, headers: { "Cache-Control": "no-store" } }
    );
  }

  try {
    const feeds = [
      { url: "https://api.rss2json.com/v1/api.json?rss_url=https://techcrunch.com/category/artificial-intelligence/feed/", publisher: "TechCrunch", category: "AI", allowedHosts: ["techcrunch.com"] },
      { url: "https://api.rss2json.com/v1/api.json?rss_url=https://www.theverge.com/rss/ai-artificial-intelligence/index.xml", publisher: "The Verge", category: "AI", allowedHosts: ["theverge.com"] },
      { url: "https://api.rss2json.com/v1/api.json?rss_url=https://cointelegraph.com/rss", publisher: "CoinTelegraph", category: "Crypto", allowedHosts: ["cointelegraph.com"] },
      { url: "https://api.rss2json.com/v1/api.json?rss_url=https://www.theverge.com/rss/policy/index.xml", publisher: "The Verge", category: "Policy", allowedHosts: ["theverge.com"] },
      { url: "https://api.rss2json.com/v1/api.json?rss_url=https://feeds.arstechnica.com/arstechnica/tech-policy", publisher: "Ars Technica", category: "Policy", allowedHosts: ["arstechnica.com"] },
      { url: "https://api.rss2json.com/v1/api.json?rss_url=https://www.theverge.com/rss/tech/index.xml", publisher: "The Verge", category: "Technology", allowedHosts: ["theverge.com"] },
      { url: "https://api.rss2json.com/v1/api.json?rss_url=https://feeds.arstechnica.com/arstechnica/index", publisher: "Ars Technica", category: "Technology", allowedHosts: ["arstechnica.com"] },
      { url: "https://api.rss2json.com/v1/api.json?rss_url=https://moxie.foxnews.com/google-publisher/latest.xml", publisher: "Fox News", category: "Fox News", allowedHosts: ["foxnews.com"] },
      { url: "https://api.rss2json.com/v1/api.json?rss_url=https://feeds.hbr.org/harvardbusiness", publisher: "Harvard Business Review", category: "Leadership", allowedHosts: ["hbr.org"] },
    ];

    const feedResults = await Promise.all(feeds.map(async (feed) => {
      try {
        const response = await fetch(feed.url, { signal: AbortSignal.timeout(12000) });
        if (!response.ok) return { feed, items: [] as RssItem[] };
        const payload: unknown = await response.json();
        const data = payload && typeof payload === "object" ? payload as RssResponse : null;
        return { feed, items: Array.isArray(data?.items) ? data.items : [] };
      } catch {
        return { feed, items: [] as RssItem[] };
      }
    }));

    const candidates = feedResults.flatMap(({ feed, items }) =>
      items
        .filter((candidate) => {
          const title = cleanFeedText(candidate.title);
          const articleText = cleanFeedText(candidate.content || candidate.description);
          const publishedAt = parsePublishedAt(candidate.pubDate);
          return Boolean(
            title.length >= 12 &&
            articleText.length >= 40 &&
            publishedAt &&
            Date.parse(publishedAt) <= Date.now() + 24 * 60 * 60 * 1000 &&
            isCategoryRelevant(feed.category, title, articleText) &&
            Boolean(getSafePublisherUrl(candidate.link, feed.publisher))
          );
        })
        .map((candidate) => ({ item: candidate, publisher: feed.publisher, category: feed.category }))
    ).sort((left, right) =>
      Date.parse(parsePublishedAt(right.item.pubDate) || "") -
      Date.parse(parsePublishedAt(left.item.pubDate) || "")
    );

    if (candidates.length === 0) {
      return NextResponse.json(
        { success: false, message: "No valid news items were available from the configured publisher feeds." },
        { status: 502 }
      );
    }

    const supabase = createSupabaseServerClient();
    const candidatesToCheck = candidates.slice(0, 50);
    const candidateTitles = candidatesToCheck.map((candidate) => cleanFeedText(candidate.item.title));
    const { data: existingStories, error: lookupError } = await supabase
      .from("news")
      .select("title")
      .in("title", candidateTitles);

    if (lookupError) {
      console.error("Existing story lookup error:", lookupError.message);
      return NextResponse.json(
        { success: false, message: "Could not check for an existing story." },
        { status: 500 }
      );
    }

    const existingTitles = new Set(
      (existingStories || []).map((story) => String(story.title || "").toLocaleLowerCase())
    );
    const selected = candidatesToCheck.find((candidate) =>
      !existingTitles.has(cleanFeedText(candidate.item.title).toLocaleLowerCase())
    );

    if (!selected) {
      return NextResponse.json({
        success: true,
        message: "All checked feed candidates already exist.",
        checked: candidatesToCheck.length,
      });
    }
    const { item, publisher, category } = selected;
    const title = cleanFeedText(item.title);
    const articleText = cleanFeedText(item.content || item.description);
    const publishedAt = parsePublishedAt(item.pubDate);

    if (!title || !articleText || !publishedAt) {
      return NextResponse.json(
        { success: false, message: "The selected feed item is incomplete." },
        { status: 422 }
      );
    }

    const publisherUrl = getSafePublisherUrl(item.link, publisher);
    if (!publisherUrl) {
      return NextResponse.json(
        { success: false, message: "The publisher link could not be verified." },
        { status: 422 }
      );
    }

    const briefing = await createEditorialBriefing({
      title,
      category,
      publisher,
      publisherUrl,
      publishedAt,
      sourceText: articleText,
    });
    const storedContent = briefing
      ? formatEditorialBriefing(briefing, publisherUrl)
      : formatSourceExcerpt(articleText, publisherUrl);
    const description = briefing
      ? briefing.summary
      : articleText.length > 240
        ? articleText.slice(0, 237).trimEnd() + "..."
        : articleText;
    const { error } = await supabase.from("news").insert([
      {
        title,
        description,
        // Store only the text present in the publisher's feed.
        content: storedContent,
        image_url: getImageUrl(item.thumbnail, item.enclosure?.link),
        source: publisher,
        category,
        // Preserve the publisher's date rather than assigning the time of this cron run.
        created_at: publishedAt,
      },
    ]);

    if (error) {
      console.error("Cron publish insert error:", error.message);
      return NextResponse.json(
        { success: false, message: "Could not save the publisher feed item." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      dispatched: title,
      source: publisher,
      category,
      publishedAt,
      aiBriefingCreated: Boolean(briefing),
    });
  } catch (error) {
    console.error("Cron publish error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
