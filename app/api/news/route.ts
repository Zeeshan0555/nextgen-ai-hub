import { NextResponse } from "next/server";
import { getPublicHeadlines } from "@/app/lib/public-news";

export const dynamic = "force-dynamic";

export async function GET() {
  const headlines = await getPublicHeadlines();

  return NextResponse.json(
    {
      success: true,
      count: headlines.length,
      news: headlines.map((item) => ({
        title: item.title,
        description: item.summary,
        content: "",
        image_url: "",
        created_at: item.publishedAt,
        source: item.source,
        category: item.category,
        publisher_url: item.publisherUrl,
      })),
    },
    { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" } }
  );
}
