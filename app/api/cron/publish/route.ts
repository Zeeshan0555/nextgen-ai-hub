import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "../../../lib/supabase-server";
import { classifyNewsHeadline } from "../../../lib/gemini-editorial";
import {
  NEWS_FEEDS,
  cleanHeadline,
  headlineMatchesFeed,
  normalizeHeadline,
  parseFeedDate,
  rssToJsonUrl,
  safePublisherUrl,
} from "../../../lib/news-sources";

export const maxDuration = 60;

type RssItem = {
  title?: string;
  link?: string;
  pubDate?: string;
};

type RssResponse = {
  items?: RssItem[];
};

function isAuthorizedCronRequest(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  const authorization = request.headers.get("authorization");
  if (!secret || secret.length < 32 || !authorization) return false;

  const expected = Buffer.from("Bearer " + secret);
  const received = Buffer.from(authorization);
  return received.length === expected.length && timingSafeEqual(received, expected);
}

function isDuplicateTitle(title: string, existing: string[]): boolean {
  const normalized = normalizeHeadline(title);
  const words = new Set(normalized.split(" ").filter((word) => word.length > 2));

  return existing.some((other) => {
    const otherNormalized = normalizeHeadline(other);
    if (normalized === otherNormalized) return true;

    const otherWords = new Set(otherNormalized.split(" ").filter((word) => word.length > 2));
    if (words.size < 6 || otherWords.size < 6) return false;
    const overlap = [...words].filter((word) => otherWords.has(word)).length;
    const union = new Set([...words, ...otherWords]).size;
    return union > 0 && overlap / union >= 0.86;
  });
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
    const feedResults = await Promise.all(NEWS_FEEDS.map(async (feed) => {
      try {
        const response = await fetch(rssToJsonUrl(feed.rssUrl), {
          signal: AbortSignal.timeout(10000),
        });
        if (!response.ok) return { feed, items: [] as RssItem[] };

        const payload: unknown = await response.json();
        if (!payload || typeof payload !== "object") return { feed, items: [] as RssItem[] };
        const items = (payload as RssResponse).items;
        return { feed, items: Array.isArray(items) ? items : [] };
      } catch {
        return { feed, items: [] as RssItem[] };
      }
    }));

    const candidates = feedResults.flatMap(({ feed, items }) =>
      items.slice(0, 20).flatMap((item) => {
        const title = cleanHeadline(item.title);
        const publishedAt = parseFeedDate(item.pubDate);
        const publisherUrl = safePublisherUrl(item.link, feed.allowedHosts);

        if (
          title.length < 12 ||
          !publishedAt ||
          Date.parse(publishedAt) > Date.now() + 24 * 60 * 60 * 1000 ||
          !publisherUrl ||
          !headlineMatchesFeed(title, feed)
        ) return [];

        return [{ title, publishedAt, publisherUrl, feed }];
      })
    ).sort((left, right) => Date.parse(right.publishedAt) - Date.parse(left.publishedAt));

    if (candidates.length === 0) {
      return NextResponse.json(
        { success: true, message: "No new eligible headlines were found.", published: false },
        { headers: { "Cache-Control": "no-store" } }
      );
    }

    const candidatesToCheck = candidates.slice(0, 50);
    const candidateTitles = candidatesToCheck.map((candidate) => candidate.title);
    const supabase = createSupabaseServerClient();
    const { data: existingStories, error: lookupError } = await supabase
      .from("news")
      .select("title")
      .in("title", candidateTitles);

    if (lookupError) {
      console.error("Existing headline lookup failed:", lookupError.message);
      return NextResponse.json(
        { success: false, message: "Could not check existing headlines." },
        { status: 500, headers: { "Cache-Control": "no-store" } }
      );
    }

    const existingTitles = (existingStories || []).map((story) => String(story.title || ""));
    const selected = candidatesToCheck.find((candidate) =>
      !isDuplicateTitle(candidate.title, existingTitles)
    );

    if (!selected) {
      return NextResponse.json(
        {
          success: true,
          message: "All checked headlines already exist or are near-duplicates.",
          checked: candidatesToCheck.length,
          published: false,
        },
        { headers: { "Cache-Control": "no-store" } }
      );
    }

    // Gemini sees only the headline and publisher metadata here, never RSS article text.
    const aiClassification = await classifyNewsHeadline({
      title: selected.title,
      publisher: selected.feed.publisher,
      defaultCategory: selected.feed.category,
    });
    const category = aiClassification?.category || selected.feed.category;
    const content = [
      "NEUROWIRE_SOURCE_LINK_V1",
      "",
      "This is an automated publisher headline. NeuroWire has not republished the article text.",
      "Open the original publisher link for full details and context.",
      "",
      "ORIGINAL_SOURCE_URL: " + selected.publisherUrl,
    ].join("\n");
    const description =
      "Headline from " + selected.feed.publisher + ". Open the original report for the full story.";

    const { error: insertError } = await supabase.from("news").insert([{
      title: selected.title,
      description,
      content,
      image_url: "",
      source: selected.feed.publisher,
      category,
      created_at: selected.publishedAt,
    }]);

    if (insertError) {
      console.error("Headline save failed:", insertError.message);
      return NextResponse.json(
        { success: false, message: "Could not save the headline." },
        { status: 500, headers: { "Cache-Control": "no-store" } }
      );
    }

    return NextResponse.json(
      {
        success: true,
        published: true,
        title: selected.title,
        source: selected.feed.publisher,
        category,
        classification: aiClassification ? "Gemini headline classification" : "Source-based section",
        publisherUrl: selected.publisherUrl,
        publishedAt: selected.publishedAt,
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("Scheduled headline publish failed:", error);
    return NextResponse.json(
      { success: false, message: "Scheduled headline publishing could not complete." },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}
