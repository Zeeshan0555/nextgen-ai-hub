import { NextResponse } from "next/server";
import { supabase } from "../../supabase";

export const revalidate = 900; // Har 15 min baad live news

const TECH_PHOTOS = [
  "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?q=80&w=800&auto=format&fit=crop",
];

export async function GET() {
  try {
    const [cryptoRes, aiRes] = await Promise.allSettled([
      fetch("https://api.rss2json.com/v1/api.json?rss_url=https://cointelegraph.com/rss"),
      fetch("https://api.rss2json.com/v1/api.json?rss_url=https://techcrunch.com/category/artificial-intelligence/feed/"),
    ]);

    let incoming: any[] = [];

    if (cryptoRes.status === "fulfilled" && cryptoRes.value.ok) {
      const data = await cryptoRes.value.json();
      if (data.items) {
        data.items.slice(0, 3).forEach((item: any, i: number) => {
          incoming.push({
            title: item.title,
            description: item.description?.replace(/<[^>]*>?/gm, "").slice(0, 180) + "...",
            content: (item.description?.replace(/<[^>]*>?/gm, "") || item.title) + "\n\nReal-time market movement recorded across primary trading venues.\n\nInstitutional volume trends indicate sustained participant interest.\n\nVerified by CoinTelegraph global market intelligence desk.",
            image_url: item.thumbnail || item.enclosure?.link || TECH_PHOTOS[i % TECH_PHOTOS.length],
            created_at: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
          });
        });
      }
    }

    if (aiRes.status === "fulfilled" && aiRes.value.ok) {
      const data = await aiRes.value.json();
      if (data.items) {
        data.items.slice(0, 3).forEach((item: any, i: number) => {
          incoming.push({
            title: item.title,
            description: item.description?.replace(/<[^>]*>?/gm, "").slice(0, 180) + "...",
            content: (item.description?.replace(/<[^>]*>?/gm, "") || item.title) + "\n\nEngineers and researchers note that accelerated model scaling is directly reshaping commercial AI architectures.\n\nVenture capital consortia and enterprise developers have rapidly consolidated around this breakthrough.\n\nFiled directly through TechCrunch Silicon Valley dispatch.",
            image_url: item.thumbnail || item.enclosure?.link || TECH_PHOTOS[(i + 2) % TECH_PHOTOS.length],
            created_at: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
          });
        });
      }
    }

    // Supabase database mein automatically save karein
    if (incoming.length > 0 && process.env.NEXT_PUBLIC_SUPABASE_URL) {
      for (const story of incoming) {
        const { data: existing } = await supabase.from("news").select("id").eq("title", story.title).single();
        if (!existing) {
          await supabase.from("news").insert([story]);
        }
      }
    }

    return NextResponse.json({ success: true, count: incoming.length });
  } catch (error) {
    return NextResponse.json({ success: false });
  }
}
