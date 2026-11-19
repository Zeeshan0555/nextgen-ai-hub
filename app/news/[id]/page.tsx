import type { Metadata } from "next";
import ArticlePageClient, { type ArticleStory } from "./ArticlePageClient";
import { createSupabaseServerClient } from "@/app/lib/supabase-server";
import { isIndexableEditorialArticle } from "@/app/lib/article-quality";

type ArticlePageProps = {
  params: Promise<{ id: string }>;
};

const BRIEFING_MARKER = "NEUROWIRE_EDITORIAL_BRIEF_V1";
const SOURCE_LINK_MARKER = "NEUROWIRE_SOURCE_LINK_V1";
const ARTICLE_MARKER = "NEUROWIRE_EDITORIAL_ARTICLE_V1";
const REQUIRED_SECTIONS = [
  "## What happened",
  "## Key details",
  "## Why it matters",
  "## What the source does not tell us",
];

const PUBLISHER_HOSTS: Record<string, string[]> = {
  "Reuters": ["reuters.com"],
  "Bloomberg": ["bloomberg.com"],
  "Financial Times": ["ft.com"],
  "The Wall Street Journal": ["wsj.com"],
  "WSJ": ["wsj.com"],
  "The New York Times": ["nytimes.com"],
  "New York Times": ["nytimes.com"],
  "BBC": ["bbc.com", "bbc.co.uk"],
  "BBC News": ["bbc.com", "bbc.co.uk"],
  "Associated Press": ["apnews.com"],
  "AP": ["apnews.com"],
  "The Guardian": ["theguardian.com"],
  "Guardian": ["theguardian.com"],
  "The Economist": ["economist.com"],
  "CNBC": ["cnbc.com"],
  "Axios": ["axios.com"],
  "Semafor": ["semafor.com"],
  "The Information": ["theinformation.com"],
  "WIRED": ["wired.com"],
  "Wired": ["wired.com"],
  "MIT Technology Review": ["technologyreview.com"],
  "CoinDesk": ["coindesk.com"],
  "Investing.com": ["investing.com"],
  "OpenAI": ["openai.com"],
  "Google DeepMind": ["deepmind.google"],
  "Google": ["blog.google"],
  "Microsoft": ["news.microsoft.com"],
  "U.S. Securities and Exchange Commission": ["sec.gov"],
  "U.S. Federal Trade Commission": ["ftc.gov"],
  "NASA": ["nasa.gov"],
  "TechCrunch": ["techcrunch.com"],
  "The Verge": ["theverge.com"],
  "CoinTelegraph": ["cointelegraph.com"],
  "Ars Technica": ["arstechnica.com"],
  "Fox News": ["foxnews.com"],
  "Harvard Business Review": ["hbr.org"],
};

function safePublisherUrl(value: unknown, publisher: string): string {
  if (typeof value !== "string" || !value.trim()) return "";
  try {
    const parsed = new URL(value.trim());
    const host = parsed.hostname.toLocaleLowerCase();
    const allowed = (PUBLISHER_HOSTS[publisher] || []).some((domain) =>
      host === domain || host.endsWith("." + domain)
    );
    return parsed.protocol === "https:" && allowed ? parsed.toString() : "";
  } catch {
    return "";
  }
}

async function getInitialArticle(title: string): Promise<ArticleStory | null> {
  if (!title) return null;

  try {
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase
      .from("news")
      .select("title, category, source, description, content, image_url, created_at")
      .eq("title", title)
      .neq("source", "NeuroWire Private Draft")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !data) return null;

    const rawContent = typeof data.content === "string" ? data.content.trim() : "";
    if (rawContent.startsWith("NEUROWIRE_PRIVATE_AUTHOR_DRAFT_V1\n")) return null;
    const lines = rawContent.split("\n");
    const sourceLine = lines.find((line) => line.startsWith("ORIGINAL_SOURCE_URL:"));
    const sourceUrl = sourceLine
      ? sourceLine.slice("ORIGINAL_SOURCE_URL:".length).trim()
      : "";
    const content = lines
      .filter((line) => !line.startsWith("NEUROWIRE_") && !line.startsWith("ORIGINAL_SOURCE_URL:"))
      .join("\n")
      .trim();
    const source = typeof data.source === "string" ? data.source : "Source not provided";
    const isEditorialBriefing = rawContent.startsWith(BRIEFING_MARKER);
    const isEditorialArticle = rawContent.startsWith(ARTICLE_MARKER);
    const isHeadlineOnly = rawContent.startsWith(SOURCE_LINK_MARKER);

    return {
      title: typeof data.title === "string" ? data.title : title,
      source,
      category: typeof data.category === "string" ? data.category : "Uncategorized",
      publisherUrl: safePublisherUrl(sourceUrl, source),
      publishedAt: typeof data.created_at === "string" ? data.created_at : "",
      image: isHeadlineOnly ? "" : typeof data.image_url === "string" ? data.image_url : "",
      summary: typeof data.description === "string" ? data.description : "",
      content,
      isEditorialBriefing,
      isEditorialArticle,
      isHeadlineOnly,
    };
  } catch {
    // The client-side fallback can still try the existing browser-safe routes.
    return null;
  }
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { id } = await params;
  const articleTitle = id || "News story";

  try {
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase
      .from("news")
      .select("title, description, content, created_at, source")
      .eq("title", articleTitle)
      .neq("source", "NeuroWire Private Draft")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !data) throw new Error("Article metadata unavailable");

    const content = typeof data.content === "string" ? data.content : "";
    const isIndexableArticle = isIndexableEditorialArticle({
      title: data.title,
      description: data.description,
      source: data.source,
      content,
    });

    if (!isIndexableArticle) {
      return {
        title: articleTitle + " | NeuroWire News",
        robots: { index: false, follow: true },
      };
    }

    const description =
      typeof data.description === "string" && data.description.length >= 50
        ? data.description.slice(0, 180)
        : "Read a source-linked NeuroWire editorial briefing.";
    const canonical = "/news/" + encodeURIComponent(articleTitle);
    const publishedAt = data.created_at;

    return {
      title: articleTitle + " | NeuroWire News",
      description,
      robots: { index: true, follow: true },
      alternates: { canonical },
      openGraph: {
        type: "article",
        title: articleTitle,
        description,
        url: canonical,
        ...(typeof publishedAt === "string" && !Number.isNaN(Date.parse(publishedAt))
          ? { publishedTime: new Date(publishedAt).toISOString() }
          : {}),
      },
      twitter: {
        card: "summary",
        title: articleTitle + " | NeuroWire News",
        description,
      },
    };
  } catch {
    return {
      title: articleTitle + " | NeuroWire News",
      robots: { index: false, follow: true },
    };
  }
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { id } = await params;
  const initialStory = await getInitialArticle(id || "");
  const articleMarkerContent = initialStory
    ? (initialStory.isEditorialBriefing
        ? BRIEFING_MARKER + "\n\n"
        : initialStory.isEditorialArticle
          ? ARTICLE_MARKER + "\n\n"
          : "") + initialStory.content
    : "";
  const isStructuredArticle = Boolean(
    initialStory &&
    (initialStory.isEditorialBriefing || initialStory.isEditorialArticle) &&
    isIndexableEditorialArticle({
      title: initialStory.title,
      description: initialStory.summary,
      source: initialStory.source,
      content: articleMarkerContent,
    })
  );
  const publishedAt = initialStory?.publishedAt;
  const canonicalUrl = "https://neurowire-news.vercel.app/news/" + encodeURIComponent(initialStory?.title || id || "");

  const structuredData = isStructuredArticle && initialStory
    ? {
        "@context": "https://schema.org",
        "@type": "NewsArticle",
        headline: initialStory.title,
        description: initialStory.summary,
        articleSection: initialStory.category,
        author: {
          "@type": "Organization",
          name: "NeuroWire News",
        },
        publisher: {
          "@type": "Organization",
          name: "NeuroWire News",
        },
        mainEntityOfPage: canonicalUrl,
        ...(typeof publishedAt === "string" && !Number.isNaN(Date.parse(publishedAt))
          ? { datePublished: new Date(publishedAt).toISOString() }
          : {}),
        ...(initialStory.publisherUrl
          ? { isBasedOn: initialStory.publisherUrl }
          : {}),
      }
    : null;

  return (
    <>
      {structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
          }}
        />
      )}
      <ArticlePageClient initialStory={initialStory} />
    </>
  );
}
