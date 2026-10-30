import { NextResponse } from "next/server";

// 1800 seconds = 30 minutes. 24 ghante mein exactly 48 bar nayi news update hogi!
export const revalidate = 1800;

const TECH_PHOTOS = [
  "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1621416894569-0f39ed31d247?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=800&auto=format&fit=crop",
];

const DEFAULT_NEWS = [
  {
    id: "1",
    title: "Crypto Hackers Outsmarted as Automated Defense Freezes Exploit in Real Time",
    category: "Crypto",
    readTime: "3 min read",
    timeAgo: "8 min ago",
    image: TECH_PHOTOS[1],
    summary: "A major smart contract drain attempt was prevented this morning after automated security nodes identified the attack signature before block inclusion.",
    simpleExplanation: "Hackers tried to steal millions from a digital bank, but smart security software locked the vault right before they could grab the cash.",
    bullets: [
      "Zero funds lost across all audited liquidity pools.",
      "Attack signature isolated within 280 milliseconds.",
      "Protocol developers credit real-time transaction verification.",
    ],
  },
  {
    id: "2",
    title: "Engineers Run Frontier Neural Models on Consumer Hardware Without Power Draw",
    category: "AI",
    readTime: "4 min read",
    timeAgo: "22 min ago",
    image: TECH_PHOTOS[0],
    summary: "Researchers demonstrated high-throughput reasoning networks operating locally on laptop processors, cutting cloud server dependence significantly.",
    simpleExplanation: "Instead of needing giant server rooms that consume tons of electricity, complex AI can now run directly on normal laptops.",
    bullets: [
      "Over 65% drop in memory footprint without losing accuracy.",
      "Enables private offline data analysis for developers.",
      "Open benchmark repository slated for public release next week.",
    ],
  },
  {
    id: "3",
    title: "Global Financial Hubs Move Closer to Sub-Second Cross-Border Digital Settlement",
    category: "Crypto",
    readTime: "3 min read",
    timeAgo: "35 min ago",
    image: TECH_PHOTOS[4],
    summary: "Leading payment infrastructure providers launched live pilot transactions settling foreign exchange wires in under two seconds.",
    simpleExplanation: "Sending money to another country used to take days and high fees; new systems now settle it in the blink of an eye.",
    bullets: [
      "Settlement speed improved from 72 hours to 1.8 seconds.",
      "Eliminates intermediary correspondent banking charges.",
      "Over $1.2 billion processed during the initial pilot phase.",
    ],
  },
  {
    id: "4",
    title: "Game Studios Adopt Live Multimodal Generation to Render 4K Interactive Worlds",
    category: "AI",
    readTime: "4 min read",
    timeAgo: "48 min ago",
    image: TECH_PHOTOS[2],
    summary: "Production teams are now streaming realistic 3D game environments synthesized on the fly using natural voice directions from level designers.",
    simpleExplanation: "Game designers can now speak to their computers and watch full 3D interactive environments generate on screen instantly.",
    bullets: [
      "Delivers reliable 60 frames per second on standard graphics cards.",
      "Direct speech controls camera angles and environmental lighting.",
      "Seamlessly links into production game engine pipelines.",
    ],
  },
];

export async function GET() {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ success: true, news: DEFAULT_NEWS });
  }

  try {
    const prompt = `You are a senior tech reporter for 'NeuroWire News', delivering live 24/7 breaking news every 30 minutes.
CRITICAL RULES FOR 100% NATURAL HUMAN ENGLISH:
1. Write in clear, sharp, engaging human journalism. Do NOT sound like an AI.
2. ABSOLUTELY FORBIDDEN BUZZWORDS: delve, testament, revolutionize, ever-evolving, beacon, crucial, furthermore, paramount, landscape, game-changer.
3. Every single field MUST be in 100% natural, crisp human English.
4. 'simpleExplanation' must be a friendly, crystal-clear 1-sentence real-world analogy in everyday human English (e.g. 'Think of it like...').

Generate 6 realistic, timely breaking news stories (3 Artificial Intelligence, 3 Crypto/Web3).
Return ONLY a valid JSON array with NO markdown wrapping, matching this exact schema:
[
  {
    "id": "1",
    "title": "Punchy human headline",
    "category": "AI",
    "readTime": "3 min read",
    "timeAgo": "Just now",
    "summary": "2 direct sentences on what took place and why readers should care.",
    "simpleExplanation": "Think of it like a simple real-world analogy.",
    "bullets": ["Concrete fact 1", "Concrete fact 2", "Concrete fact 3"]
  }
]`;

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    );

    if (!res.ok) {
      return NextResponse.json({ success: true, news: DEFAULT_NEWS });
    }

    const data = await res.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    const cleanJson = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
    const parsed = JSON.parse(cleanJson);

    // Attach high-res photos automatically
    const newsWithPhotos = parsed.map((item: any, idx: number) => ({
      ...item,
      image: TECH_PHOTOS[idx % TECH_PHOTOS.length],
    }));

    return NextResponse.json({ success: true, news: newsWithPhotos });
  } catch (error) {
    return NextResponse.json({ success: true, news: DEFAULT_NEWS });
  }
}
