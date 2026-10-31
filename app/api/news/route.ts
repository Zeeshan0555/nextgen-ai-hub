import { NextResponse } from "next/server";

export const revalidate = 1800; // Har 30 minute baad update

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
    readTime: "6 min read",
    timeAgo: "8 min ago",
    image: TECH_PHOTOS[1],
    source: "Bloomberg Technology",
    summary: "A major smart contract drain attempt was prevented this morning after automated security nodes identified the attack signature before block inclusion.",
    simpleExplanation: "Hackers tried to break into a decentralized crypto treasury, but automated code inspectors intercepted the fraudulent transaction within milliseconds.",
    fullArticle: `In what security researchers are describing as one of the most sophisticated on-chain confrontations this quarter, automated defense protocols on the Ethereum network successfully neutralised a multi-million-dollar exploitation attempt in the early hours of Saturday.\n\nThe target was a decentralized liquidity pool holding over $140 million in deposited collateral. According to post-mortem transaction logs, the attacker initiated a series of rapid flash-loan requests engineered to artificially depress token exchange rates across decentralized trading venues.\n\nHistorically, attacks of this magnitude take several hours to mitigate, often requiring governance council members to manually vote on emergency pauses. By the time human operators intervene, funds have typically vanished through privacy tumblers. This time, however, latency-optimised validation nodes running automated invariant checks detected the abnormal withdrawal volume prior to transaction finality.\n\nThe protocol automatically routed counter-transactions through private mempools, effectively neutralizing the attacker’s contract execution and locking the vulnerable reserve vaults before any digital assets were drained.\n\nInstitutional depositors breathed a collective sigh of relief as market analysts reiterated that autonomous smart contract defenses are shifting from speculative experimental software into foundational critical infrastructure. The team behind the protocol has confirmed that a full forensic security audit will be made publicly accessible by early next week, underscoring a milestone victory for automated decentralized security.`,
    bullets: [
      "Zero customer funds drained across audited liquidity pools.",
      "Anomalous attack pattern caught in under 280 milliseconds.",
      "Sets precedent for autonomous, machine-speed smart contract defense.",
    ],
  },
  {
    id: "2",
    title: "Engineers Run Frontier Neural Models on Consumer Hardware Without Power Draw",
    category: "AI",
    readTime: "5 min read",
    timeAgo: "22 min ago",
    image: TECH_PHOTOS[0],
    source: "Reuters Tech Desk",
    summary: "Researchers demonstrated high-throughput reasoning networks operating locally on laptop processors, cutting cloud server dependence significantly.",
    simpleExplanation: "Instead of needing giant server rooms that consume tons of electricity, complex AI can now run directly on normal laptops.",
    fullArticle: `Hardware engineers and computer scientists have achieved what many thought was years away: running complex, multi-billion-parameter neural reasoning architectures directly on standard consumer silicon without triggering thermal throttling or rapid battery exhaustion.\n\nTraditionally, running frontier-tier AI requires vast clusters of power-hungry data center accelerators, each consuming hundreds of watts and costing tens of thousands of dollars to operate continuously. This has created a bottleneck where developers and everyday users remain bound to centralized cloud subscriptions.\n\nThe breakthrough centers around a new quantization scheme that dynamically reduces precision on dormant neural pathways while maintaining high-fidelity calculations during critical reasoning steps. Testing revealed that laptops equipped with standard integrated chips executed multi-turn code synthesis and mathematical proofs at speeds comparable to enterprise server setups.\n\nCrucially, energy draw remained well below thirty watts during extended operational benchmarks. Industry observers note that running autonomous AI agents locally on personal computers preserves user privacy, eliminates data transmission latency, and allows sophisticated computing in offline environments.\n\nWith open-source toolkits scheduled for general release, local intelligence is rapidly transitioning from a tech enthusiast dream into an accessible reality for software creators worldwide.`,
    bullets: [
      "Cuts energy requirements by over 65% on consumer-grade silicon.",
      "Permits complex logical deduction without sending data to cloud servers.",
      "Open-weights repository slated for public deployment this month.",
    ],
  },
];

// GET: NAYI NEWS GENERATOR (AQ. KEY FORMAT KE LIYE UPDATED)
export async function GET() {
  const apiKey = (process.env.GEMINI_API_KEY || "").trim();
  if (!apiKey) return NextResponse.json({ success: true, news: DEFAULT_NEWS });

  try {
    const prompt = `You are an elite senior investigative tech reporter for 'NeuroWire News'.
CRITICAL WRITING RULES:
1. Write in 100% natural, crisp, human English journalism. Absolutely NO AI clichés.
2. For each news story, write an IN-DEPTH 'fullArticle' consisting of 4 rich paragraphs (25 to 30 lines).
3. Assign a realistic credible 'source' (e.g. 'Bloomberg Technology', 'Reuters Wire', 'Wired Tech News', 'CoinDesk Markets').

Generate 4 timely breaking news stories (2 AI breakthroughs, 2 Crypto/Web3).
Return ONLY valid JSON array with NO markdown wrapping, matching this exact schema:
[
  {
    "id": "1",
    "title": "Punchy human headline",
    "category": "AI",
    "readTime": "6 min read",
    "timeAgo": "Just now",
    "source": "Bloomberg Technology",
    "summary": "2 direct sentences on what happened and why it matters.",
    "simpleExplanation": "Friendly 1-sentence real-world analogy in everyday English.",
    "fullArticle": "Paragraph 1...\\n\\nParagraph 2...\\n\\nParagraph 3...\\n\\nParagraph 4...",
    "bullets": ["Key point 1", "Key point 2", "Key point 3"]
  }
]`;

    const res = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    );

    if (!res.ok) return NextResponse.json({ success: true, news: DEFAULT_NEWS });

    const data = await res.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    const cleanJson = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
    const parsed = JSON.parse(cleanJson);

    const newsWithPhotos = parsed.map((item: any, idx: number) => ({
      ...item,
      image: TECH_PHOTOS[idx % TECH_PHOTOS.length],
    }));

    return NextResponse.json({ success: true, news: newsWithPhotos });
  } catch (error) {
    return NextResponse.json({ success: true, news: DEFAULT_NEWS });
  }
}

// POST: REAL CHATBOT (AQ. KEY FORMAT KE LIYE UPDATED)
export async function POST(req: Request) {
  const apiKey = (process.env.GEMINI_API_KEY || "").trim();

  try {
    const { message } = await req.json();

    if (apiKey) {
      try {
        const systemPrompt = `You are the official conversational AI of 'NeuroWire News'.
Respond in an authentic, friendly, and natural human tone. If the user writes in Roman Urdu (e.g. "ye website kis maqsad ke liye hai"), answer in natural Roman Urdu. If they write in English, reply in crisp English.
Website purpose: NeuroWire News is an independent intelligence wire covering artificial intelligence, robotics, and crypto markets.
User Question: "${message}"`;

        const res = await fetch(
          "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-goog-api-key": apiKey,
            },
            body: JSON.stringify({
              contents: [{ parts: [{ text: systemPrompt }] }],
            }),
          }
        );

        if (res.ok) {
          const data = await res.json();
          const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (reply && reply.trim()) {
            return NextResponse.json({ reply: reply.trim() });
          }
        }
      } catch (e) {
        // Fallback
      }
    }

    return NextResponse.json({
      reply: "NeuroWire News is an independent media platform reporting 24/7 intelligence on Artificial Intelligence breakthroughs, supercomputing, and Web3 crypto markets.",
    });
  } catch (err) {
    return NextResponse.json({
      reply: "NeuroWire News delivers 24/7 verified journalism on artificial intelligence and decentralized technologies.",
    });
  }
            }
