import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "../../../lib/supabase-server";

export async function GET() {
  try {
    const res = await fetch("https://api.rss2json.com/v1/api.json?rss_url=https://techcrunch.com/category/artificial-intelligence/feed/");
    if (!res.ok) {
      return NextResponse.json({ success: false, message: "RSS feed unavailable" }, { status: 502 });
    }

    const data = await res.json();
    if (!data?.items?.length) {
      return NextResponse.json({ success: false, message: "No intelligence feeds available" }, { status: 404 });
    }

    const item = data.items[0];
    const rawTitle = item.title;
    const cleanDesc = item.description ? item.description.replace(/<[^>]*>/gi, "") : "Strategic market evolution detected across neural compute clusters.";

    const supabase = createSupabaseServerClient();

    const { data: existing } = await supabase
      .from("news")
      .select("id")
      .eq("title", rawTitle)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ success: true, message: "Wire already synchronized." });
    }

    const editorialImages = [
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=1600&auto=format&fit=crop",
    ];
    const selectedImage = editorialImages[Math.floor(Math.random() * editorialImages.length)];

    const deepReportParagraphs = [
      `[EXECUTIVE DISPATCH]: ${cleanDesc}`,
      "Comprehensive telemetry gathered from decentralized deployment nodes indicates a profound structural acceleration in enterprise AI integration. Market participants are rapidly transitioning from experimental pilot architectures to mission-critical, autonomous neural pipelines.",
      "Regulatory bodies across multiple jurisdictions have simultaneously initiated secondary compliance oversight frameworks. These measures aim to address latent vulnerabilities in autonomous cross-agent execution, data sovereignty, and algorithmic accountability.",
      "Financial institutions and venture syndicates are re-allocating capital toward foundational silicon infrastructure and quantum-resistant cryptographic protocols, anticipating bottleneck constraints through the next fiscal cycle.",
      "Strategic foresight analysis suggests that entities failing to secure dedicated high-performance compute clusters will face compounding operational friction as network complexity scales exponentially.",
    ];

    const { error } = await supabase.from("news").insert([
      {
        title: rawTitle,
        description: cleanDesc.slice(0, 250) + "...",
        content: deepReportParagraphs.join("\n\n"),
        image_url: selectedImage,
        source: "NeuroWire Intelligence Desk",
        category: "AI",
        created_at: new Date().toISOString(),
      },
    ]);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      dispatched: rawTitle,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error("Cron publish error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
