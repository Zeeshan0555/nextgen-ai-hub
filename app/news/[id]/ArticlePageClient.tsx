"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Bookmark, BookmarkCheck, ExternalLink, ShieldCheck } from "lucide-react";
import { readSavedStories, toggleSavedStory } from "@/app/lib/reader-saved";
import { supabase } from "@/lib/supabase";

export type ArticleStory = {
  title: string;
  source: string;
  category: string;
  publisherUrl: string;
  publishedAt: string;
  image: string;
  summary: string;
  content: string;
  isEditorialBriefing: boolean;
  isEditorialArticle: boolean;
  isHeadlineOnly: boolean;
};

function getSafePublisherUrl(value: unknown, publisher: string): string {
  if (typeof value !== "string" || !value.trim()) return "";
  const publisherHosts: Record<string, string[]> = {
    "Reuters": ["reuters.com"],
    "Bloomberg": ["bloomberg.com"],
    "Financial Times": ["ft.com"],
    "The Wall Street Journal": ["wsj.com"],
    "WSJ": ["wsj.com"],
    "The New York Times": ["nytimes.com"],
    "New York Times": ["nytimes.com"],
    "BBC": ["bbc.com", "bbc.co.uk"],
    "Associated Press": ["apnews.com"],
    "AP": ["apnews.com"],
    "The Guardian": ["theguardian.com"],
    "Guardian": ["theguardian.com"],
    "The Economist": ["economist.com"],
    "CNBC": ["cnbc.com"],
    "Axios": ["axios.com"],
    "Semafor": ["semafor.com"],
    "The Information": ["theinformation.com"],
    "TechCrunch": ["techcrunch.com"],
    "The Verge": ["theverge.com"],
    "WIRED": ["wired.com"],
    "Wired": ["wired.com"],
    "Ars Technica": ["arstechnica.com"],
    "MIT Technology Review": ["technologyreview.com"],
    "CoinDesk": ["coindesk.com"],
    "CoinTelegraph": ["cointelegraph.com"],
    "Investing.com": ["investing.com"],
    "Fox News": ["foxnews.com"],
    "Harvard Business Review": ["hbr.org"],
    "OpenAI": ["openai.com"],
    "Google DeepMind": ["deepmind.google"],
    "Google": ["blog.google"],
    "Microsoft": ["news.microsoft.com"],
    "U.S. Securities and Exchange Commission": ["sec.gov"],
    "U.S. Federal Trade Commission": ["ftc.gov"],
    "NASA": ["nasa.gov"],
  };
  try {
    const parsed = new URL(value);
    const host = parsed.hostname.toLocaleLowerCase();
    const allowed = (publisherHosts[publisher] || []).some((domain) =>
      host === domain || host.endsWith("." + domain)
    );
    return parsed.protocol === "https:" && allowed ? parsed.toString() : "";
  } catch {
    return "";
  }
}

function formatModernTimestamp(isoString: string): string {
  if (!isoString) return "Publication date unavailable";

  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return "Publication date unavailable";

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export default function ArticlePageClient({ initialStory }: { initialStory: ArticleStory | null }) {
  const params = useParams();
  const rawId = params?.id;
  const decodedTitle = Array.isArray(rawId) ? rawId[0] : rawId || "";
  const router = useRouter();

  const [story, setStory] = useState<ArticleStory | null>(initialStory);
  const [loading, setLoading] = useState(!initialStory);
  const [loadError, setLoadError] = useState("");
  const [isSaved, setIsSaved] = useState(false);
  const [saveNotice, setSaveNotice] = useState("");

  useEffect(() => {
    if (initialStory) {
      setStory(initialStory);
      setLoading(false);
      return;
    }

    let active = true;

    async function fetchStory() {
      try {
        const queryPublisherValue = new URLSearchParams(window.location.search).get("source");
        const queryPublisherUrl = typeof queryPublisherValue === "string" &&
          queryPublisherValue.startsWith("https://")
          ? queryPublisherValue
          : "";
        // First look for the story already published in NeuroWire's news table.
        // This keeps manually published and scheduled stories readable as well.
        const { data: storedStory, error: storedStoryError } = await supabase
          .from("news")
          .select("*")
          .eq("title", decodedTitle)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (storedStory) {
          const storedRawContent =
            typeof storedStory.content === "string" && storedStory.content.trim()
              ? storedStory.content.trim()
              : typeof storedStory.description === "string"
                ? storedStory.description.trim()
                : "";
          const contentLines = storedRawContent.split("\n");
          const sourceUrlLine = contentLines.find((line) => line.startsWith("ORIGINAL_SOURCE_URL:"));
          const storedSourceUrl = sourceUrlLine
            ? sourceUrlLine.slice("ORIGINAL_SOURCE_URL:".length).trim()
            : "";
          const storedContent = contentLines
            .filter((line) => !line.startsWith("NEUROWIRE_") && !line.startsWith("ORIGINAL_SOURCE_URL:"))
            .join("\n")
            .trim();
          const isEditorialBriefing = storedRawContent.startsWith("NEUROWIRE_EDITORIAL_BRIEF_V1");
          const isEditorialArticle = storedRawContent.startsWith("NEUROWIRE_EDITORIAL_ARTICLE_V1");
          const isHeadlineOnly = storedRawContent.startsWith("NEUROWIRE_SOURCE_LINK_V1");

          if (active) {
            setStory({
              title: typeof storedStory.title === "string" ? storedStory.title : decodedTitle,
              source: typeof storedStory.source === "string" ? storedStory.source : "Source not provided",
              category: typeof storedStory.category === "string" ? storedStory.category : "Uncategorized",
              publisherUrl:
                getSafePublisherUrl(storedSourceUrl, typeof storedStory.source === "string" ? storedStory.source : "") ||
                getSafePublisherUrl(storedStory.publisher_url, typeof storedStory.source === "string" ? storedStory.source : "") ||
                getSafePublisherUrl(storedStory.source_url, typeof storedStory.source === "string" ? storedStory.source : "") ||
                getSafePublisherUrl(queryPublisherUrl, typeof storedStory.source === "string" ? storedStory.source : ""),
              publishedAt: typeof storedStory.created_at === "string" ? storedStory.created_at : "",
              image: !isHeadlineOnly && typeof storedStory.image_url === "string" ? storedStory.image_url : "",
              summary: typeof storedStory.description === "string" ? storedStory.description : storedContent,
              content: isHeadlineOnly ? "" : storedContent,
              isEditorialBriefing,
              isEditorialArticle,
              isHeadlineOnly,
            });
          }
          return;
        }

        if (storedStoryError) {
          console.warn("Stored story lookup was unavailable; checking publisher feeds.", storedStoryError.message);
        }

        const response = await fetch("/api/news", { cache: "no-store" });
        if (!response.ok) throw new Error("The publisher feeds could not be reached.");

        const payload = await response.json();
        if (payload?.success !== true || !Array.isArray(payload.news)) {
          throw new Error("The publisher feed returned an invalid response.");
        }

        const found = payload.news.find(
          (item: Record<string, unknown>) =>
            typeof item.title === "string" &&
            item.title.toLocaleLowerCase() === decodedTitle.toLocaleLowerCase()
        );

        if (!found) {
          if (active) setLoadError("This story is no longer available in the current publisher feeds.");
          return;
        }

        const articleText =
          typeof found.content === "string" && found.content.trim()
            ? found.content.trim()
            : typeof found.description === "string"
              ? found.description.trim()
              : "";

        if (active) {
          setStory({
            title: typeof found.title === "string" ? found.title : "Untitled story",
            source: typeof found.source === "string" ? found.source : "Publisher not provided",
            category: typeof found.category === "string" ? found.category : "News",
            publisherUrl: getSafePublisherUrl(found.publisher_url, typeof found.source === "string" ? found.source : "") || getSafePublisherUrl(queryPublisherUrl, typeof found.source === "string" ? found.source : ""),
            publishedAt: typeof found.created_at === "string" ? found.created_at : "",
            image: typeof found.image_url === "string" ? found.image_url : "",
            summary: typeof found.description === "string" ? found.description : articleText,
            content: articleText,
            isEditorialBriefing: false,
            isEditorialArticle: false,
            isHeadlineOnly: true,
          });
        }
      } catch (error) {
        if (active) {
          setLoadError(error instanceof Error ? error.message : "Could not load this story.");
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    if (decodedTitle) {
      fetchStory();
    } else {
      setLoadError("No story was selected.");
      setLoading(false);
    }

    return () => {
      active = false;
    };
  }, [decodedTitle, initialStory]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070b14] text-white flex items-center justify-center">
        <p className="text-cyan-400">Loading story...</p>
      </div>
    );
  }

  if (!story) {
    return (
      <div className="min-h-screen bg-[#070b14] text-white flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-2xl font-bold mb-3">Story not available</h1>
        <p className="text-sm text-slate-400 max-w-md mb-6">{loadError || "The selected story could not be found."}</p>
        <button
          type="button"
          onClick={() => router.push("/")}
          className="flex items-center gap-2 px-4 py-2 bg-cyan-500 text-slate-950 rounded-xl font-semibold hover:bg-cyan-400"
        >
          <ArrowLeft className="h-4 w-4" /> Back to news
        </button>
      </div>
    );
  }

  useEffect(() => {
    if (!story) {
      setIsSaved(false);
      return;
    }
    const normalizedTitle = story.title.trim().toLocaleLowerCase();
    setIsSaved(readSavedStories().some(
      (saved) => saved.title.trim().toLocaleLowerCase() === normalizedTitle
    ));
  }, [story?.title]);

  const handleToggleSavedStory = () => {
    if (!story) return;
    const result = toggleSavedStory({
      title: story.title,
      category: story.category,
      source: story.source,
      publishedAt: story.publishedAt,
      image: story.image,
      publisherUrl: story.publisherUrl,
      summary: story.summary,
    });
    if (!result.persisted) {
      setSaveNotice("Could not save this story in your browser.");
      return;
    }
    setIsSaved(result.saved);
    setSaveNotice(result.saved ? "Saved on this device." : "Removed from saved stories.");
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 font-sans pb-20">
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40 px-4 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button
            type="button"
            onClick={() => router.push("/")}
            className="flex items-center gap-2 text-sm text-cyan-400 hover:text-cyan-300"
          >
            <ArrowLeft className="h-4 w-4" /> Back to news
          </button>
          <span className="text-xs text-slate-500 uppercase tracking-widest hidden sm:inline">NeuroWire News</span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 pt-10 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded-full text-cyan-300">{story.category}</span>
            <span className="text-slate-300">{story.source}</span>
          </div>
          <time className="text-slate-400">{formatModernTimestamp(story.publishedAt)}</time>
        </div>

        <h1 className="text-3xl md:text-4xl font-extrabold text-white leading-tight">{story.title}</h1>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleToggleSavedStory}
            aria-pressed={isSaved}
            className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold transition-colors ${isSaved ? "border-cyan-500/40 bg-cyan-500/10 text-cyan-200" : "border-slate-700 bg-slate-900 text-slate-300 hover:text-white"}`}
          >
            {isSaved ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
            {isSaved ? "Saved" : "Save story"}
          </button>
          {saveNotice && <p role="status" aria-live="polite" className="text-xs text-cyan-300">{saveNotice}</p>}
        </div>

        {story.publisherUrl && (
          <a
            href={story.publisherUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-400 hover:text-cyan-300 underline underline-offset-4"
          >
            Read the original story at {story.source}
            <ExternalLink className="h-4 w-4" />
          </a>
        )}

        {!story.isHeadlineOnly && (
        <div className="h-64 md:h-96 w-full rounded-3xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-900">
          {story.image ? (
            <img src={story.image} alt={story.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-sm text-slate-500">
              Publisher image not available
            </div>
          )}
        </div>        )}

        {story.isHeadlineOnly ? (
          <section className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80">
            <h2 className="text-xs uppercase tracking-wider text-cyan-400 mb-3">Headline listing</h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              This page only points to the publisher's headline. Open the original report above for the full story and latest updates.
            </p>
          </section>
        ) : (
          <section className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80">
            <h2 className="text-xs uppercase tracking-wider text-cyan-400 mb-3">{story.isEditorialBriefing ? "NeuroWire AI-assisted briefing" : story.isEditorialArticle ? "NeuroWire original article" : "Publisher excerpt"}</h2>
            <div className="text-base text-slate-200 leading-relaxed whitespace-pre-line">
              {(story.content || story.summary || "The publisher did not provide an excerpt.").replace(/^## /gm, "").replace(/^- /gm, "• ").replace(/^  Evidence from source:/gm, "Evidence from source:")}
            </div>
          </section>
        )}

        <div className="flex items-start gap-3 p-4 rounded-xl bg-slate-950 border border-slate-800">
          <ShieldCheck className="h-5 w-5 text-cyan-400 shrink-0 mt-0.5" />
          <p className="text-xs text-slate-400 leading-relaxed">
            {story.isHeadlineOnly ? "This page provides a headline and a direct link only. NeuroWire does not republish the publisher article here." : story.isEditorialBriefing ? "This AI-assisted briefing was created from editor-provided source notes. Evidence excerpts are included, but the briefing has not been independently fact-checked. Open the original publisher report for full context and updates." : story.isEditorialArticle ? "This original NeuroWire article was prepared for this newsroom and should be read alongside its cited source links. Corrections should be made when an error is identified." : "This is a publisher excerpt, not a full NeuroWire investigation. Open the original publisher link for the complete article and any updates. NeuroWire has not independently verified every claim."}
          </p>
        </div>
      </main>
    </div>
  );
}
