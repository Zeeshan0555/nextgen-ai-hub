import type { Metadata } from "next";
import ArticlePageClient from "./ArticlePageClient";
import { createSupabaseServerClient } from "@/app/lib/supabase-server";

type ArticlePageProps = {
  params: Promise<{ id: string }>;
};

const BRIEFING_MARKER = "NEUROWIRE_EDITORIAL_BRIEF_V1";
const REQUIRED_SECTIONS = [
  "## What happened",
  "## Key details",
  "## Why it matters",
  "## What the source does not tell us",
];

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { id } = await params;
  const articleTitle = id || "News story";

  try {
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase
      .from("news")
      .select("title, description, content")
      .eq("title", articleTitle)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !data) throw new Error("Article metadata unavailable");

    const content = typeof data.content === "string" ? data.content : "";
    const isIndexableBriefing =
      content.startsWith(BRIEFING_MARKER) &&
      content.length >= 500 &&
      REQUIRED_SECTIONS.every((section) => content.includes(section));

    if (!isIndexableBriefing) {
      return {
        title: articleTitle + " | NeuroWire News",
        robots: { index: false, follow: true },
      };
    }

    return {
      title: articleTitle + " | NeuroWire News",
      description:
        typeof data.description === "string" && data.description.length >= 50
          ? data.description.slice(0, 180)
          : "Read a source-linked NeuroWire editorial briefing.",
      robots: { index: true, follow: true },
      alternates: {
        canonical: "/news/" + encodeURIComponent(articleTitle),
      },
    };
  } catch {
    return {
      title: articleTitle + " | NeuroWire News",
      robots: { index: false, follow: true },
    };
  }
}

export default function ArticlePage() {
  return <ArticlePageClient />;
}
