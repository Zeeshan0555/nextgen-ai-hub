import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "../../../lib/supabase-server";

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
      { url: "https://api.rss2json.com/v1/api.json?rss_url=https://techcrunch.com/category/artificial-intelligence/feed/", publisher: "TechCrunch", category: "AI" },
      { url: "https://api.rss2json.com/v1/api.json?rss_url=https://cointelegraph.com/rss", publisher: "CoinTelegraph", category: "Crypto" },
      { url: "https://api.rss2json.com/v1/api.json?rss_url=https://www.theverge.com/rss/policy/index.xml", publisher: "The Verge", category: "Policy" },
      { url: "https://api.rss2json.com/v1/api.json?rss_url=https://techcrunch.com/category/government-policy/feed/", publisher: "TechCrunch", category: "Policy" },
      { url: "https://api.rss2json.com/v1/api.json?rss_url=https://www.theverge.com/rss/tech/index.xml", publisher: "The Verge", category: "Technology" },
      { url: "https://api.rss2json.com/v1/api.json?rss_url=https://feeds.arstechnica.com/arstechnica/index", publisher: "Ars Technica", category: "Technology" },
      { url: "https://api.rss2json.com/v1/api.json?rss_url=https://moxie.foxnews.com/google-publisher/latest.xml", publisher: "Fox News", category: "Fox News" },
      { url: "https://api.rss2json.com/v1/api.json?rss_url=https://feeds.hbr.org/harvardbusiness", publisher: "Harvard Business Review", category: "Leadership" },
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
        .filter((candidate) =>
          cleanFeedText(candidate.title) &&
          parsePublishedAt(candidate.pubDate) &&
          (cleanFeedText(candidate.content) || cleanFeedText(candidate.description))
        )
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

    const { item, publisher, category } = candidates[0];
    const title = cleanFeedText(item.title);
    const articleText = cleanFeedText(item.content || item.description);
    const publishedAt = parsePublishedAt(item.pubDate);

    // The item was validated above; keep this guard for safe handling of feed changes.
    if (!title || !articleText || !publishedAt) {
      return NextResponse.json(
        { success: false, message: "The selected feed item is incomplete." },
        { status: 422 }
      );
    }

    const description =
      articleText.length > 250
        ? `${articleText.slice(0, 247).trimEnd()}...`
        : articleText;

    const supabase = createSupabaseServerClient();

    const { data: existing, error: lookupError } = await supabase
      .from("news")
      .select("id")
      .eq("title", title)
      .maybeSingle();

    if (lookupError) {
      console.error("Existing story lookup error:", lookupError.message);
      return NextResponse.json(
        { success: false, message: "Could not check for an existing story." },
        { status: 500 }
      );
    }

    if (existing) {
      return NextResponse.json({ success: true, message: "Story already exists." });
    }

    const { error } = await supabase.from("news").insert([
      {
        title,
        description,
        // Store only the text present in the publisher's feed.
        content: articleText,
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
