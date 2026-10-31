"use client";

import React, { useState, useEffect } from "react";
import {
  Sparkles,
  TrendingUp,
  Volume2,
  VolumeX,
  Search,
  Send,
  X,
  Zap,
  Bot,
  ArrowUpRight,
  Cpu,
  CheckCircle2,
  Share2,
  Globe,
  Video,
  MessageSquare,
  RefreshCw,
  BookOpen,
} from "lucide-react";

interface NewsItem {
  id: string;
  title: string;
  category: "AI" | "Crypto" | "Tools";
  readTime: string;
  timeAgo: string;
  image?: string;
  source?: string;
  summary: string;
  simpleExplanation: string;
  fullArticle?: string;
  bullets: string[];
}

const CRYPTO_PRICES = [
  { pair: "BTC/USDT", price: "$98,450.20", change: "+3.4%" },
  { pair: "ETH/USDT", price: "$3,620.80", change: "+2.1%" },
  { pair: "SOL/USDT", price: "$235.40", change: "+6.8%" },
  { pair: "RENDER/USDT", price: "$11.15", change: "+12.4%" },
];

const INITIAL_NEWS: NewsItem[] = [
  {
    id: "1",
    title: "Crypto Hackers Outsmarted as Automated Defense Freezes Exploit in Real Time",
    category: "Crypto",
    readTime: "6 min read",
    timeAgo: "Just now",
    image: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=800&auto=format&fit=crop",
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
    timeAgo: "15 min ago",
    image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop",
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

const AI_TOOLS = [
  { name: "NeuralForge 3.0", desc: "Autonomous full-stack web developer agent.", tag: "Dev Tool", badge: "Trending" },
  { name: "CryptoPulse AI", desc: "Real-time on-chain anomaly detector dashboard.", tag: "Web3 Analytics", badge: "New" },
  { name: "VoiceMesh Pro", desc: "Ultra-realistic zero-shot multi-language voice cloner.", tag: "Audio Gen", badge: "Hot" },
];

export default function NeuroWirePlatform() {
  const [newsData, setNewsData] = useState<NewsItem[]>(INITIAL_NEWS);
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [readingId, setReadingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [activeModal, setActiveModal] = useState<{
    type: "summary" | "simple" | "full";
    item: NewsItem;
  } | null>(null);

  // REAL LIVE GEMINI CHATBOT (100% PURE ENGLISH WELCOME)
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<{ sender: "user" | "ai"; text: string }[]>([
    { sender: "ai", text: "👋 Hello! I am your NeuroWire Intelligence Assistant. Ask me anything about our breaking AI reports, crypto markets, or tech developments." },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isAiReplying, setIsAiReplying] = useState(false);

  useEffect(() => {
    fetchLiveNews();
  }, []);

  const fetchLiveNews = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/news");
      if (res.ok) {
        const data = await res.json();
        if (data.news && data.news.length > 0) {
          setNewsData(data.news);
        }
      }
    } catch (err) {
      console.log("Cached wire active");
    } finally {
      setLoading(false);
    }
  };

  const toggleSpeech = (item: NewsItem) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      alert("Audio reader not supported on this browser.");
      return;
    }
    if (readingId === item.id) {
      window.speechSynthesis.cancel();
      setReadingId(null);
    } else {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(`${item.title}. Summary: ${item.summary}`);
      utterance.onend = () => setReadingId(null);
      utterance.onerror = () => setReadingId(null);
      window.speechSynthesis.speak(utterance);
      setReadingId(item.id);
    }
  };

  const handleSendMessage = async (customMsg?: string) => {
    const textToSend = customMsg || chatInput;
    if (!textToSend.trim() || isAiReplying) return;

    setChatMessages((prev) => [...prev, { sender: "user", text: textToSend }]);
    if (!customMsg) setChatInput("");
    setIsAiReplying(true);

    try {
      const res = await fetch("/api/news", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: textToSend }),
      });
      const data = await res.json();
      setChatMessages((prev) => [
        ...prev,
        { sender: "ai", text: data.reply || "I am analyzing the latest dispatch report." },
      ]);
    } catch (err) {
      setChatMessages((prev) => [
        ...prev,
        { sender: "ai", text: "NeuroWire News covers 24/7 intelligence on AI and Web3 technologies." },
      ]);
    } finally {
      setIsAiReplying(false);
    }
  };

  const filteredNews = newsData.filter((item) => {
    const matchesCategory = activeCategory === "All" || item.category === activeCategory;
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.summary.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const heroStory = newsData[0] || INITIAL_NEWS[0];

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 font-sans antialiased">
      {/* 1. TOP LIVE CRYPTO TICKER */}
      <div className="bg-slate-950 border-b border-slate-800 py-2 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-cyan-400 font-semibold uppercase shrink-0 pr-4 border-r border-slate-800">
            <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse"></span> 24/7 Live Wire
          </div>
          <div className="flex items-center gap-6 overflow-x-auto whitespace-nowrap pl-4">
            {CRYPTO_PRICES.map((c, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-slate-400">{c.pair}</span>
                <span className="font-semibold text-slate-200">{c.price}</span>
                <span className="text-emerald-400 font-mono text-[11px]">{c.change}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 2. NAVBAR */}
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="text-2xl font-black text-white">
                Neuro<span className="text-cyan-400">Wire</span>
              </span>
              <p className="text-[10px] uppercase text-slate-400 font-mono">Verified Tech & Web3 Wire</p>
            </div>
          </div>

          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search reports or topics..."
              className="w-full bg-slate-950 border border-slate-800 rounded-full pl-9 pr-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <nav className="flex items-center gap-6 text-sm text-slate-300">
            <a href="#hero" className="hover:text-cyan-400">Top Story</a>
            <a href="#news" className="hover:text-cyan-400">Wire Feed</a>
            <a href="#tools" className="hover:text-cyan-400">Tools</a>
          </nav>
        </div>
      </header>

      {/* 3. HERO STORY */}
      <section id="hero" className="max-w-7xl mx-auto px-4 pt-8 pb-10">
        <div className="relative rounded-3xl border border-slate-800 bg-slate-900/80 overflow-hidden shadow-2xl">
          {heroStory.image && (
            <div className="relative h-64 md:h-96 w-full overflow-hidden">
              <img
                src={heroStory.image}
                alt={heroStory.title}
                className="w-full h-full object-cover opacity-50"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#070b14] via-[#070b14]/60 to-transparent" />
            </div>
          )}

          <div className="p-6 md:p-8 -mt-24 relative z-10 space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="bg-red-500/20 text-red-400 border border-red-500/40 text-xs px-3 py-1 rounded-full font-bold uppercase animate-pulse">
                ● Breaking Exclusive
              </span>
              {heroStory.source && (
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800/40 font-mono">
                  Source: {heroStory.source}
                </span>
              )}
              <span className="text-xs text-slate-400 font-mono">{heroStory.readTime} • {heroStory.timeAgo}</span>
            </div>

            <h1 className="text-2xl md:text-4xl font-extrabold text-white leading-tight max-w-4xl">
              {heroStory.title}
            </h1>

            <p className="text-sm text-slate-300 leading-relaxed max-w-3xl">
              {heroStory.summary}
            </p>

            <button
              onClick={() => setActiveModal({ type: "full", item: heroStory })}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all"
            >
              <BookOpen className="h-4 w-4" /> Read Full In-Depth Story
            </button>
          </div>
        </div>
      </section>

      {/* 4. NEWS FEED */}
      <section id="news" className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-white">Live Intelligence Wire</h2>
            <button
              onClick={fetchLiveNews}
              disabled={loading}
              className="p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-cyan-400 transition-all"
              title="Refresh Wire"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>

          <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-full border border-slate-800">
            {["All", "AI", "Crypto"].map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold ${
                  activeCategory === cat ? "bg-cyan-500 text-black font-bold" : "text-slate-400"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNews.map((item) => (
            <div
              key={item.id}
              className="bg-slate-900/50 border border-slate-800 rounded-3xl p-5 flex flex-col justify-between group hover:border-slate-700 transition-all shadow-xl"
            >
              <div>
                {item.image && (
                  <div className="relative h-44 w-full rounded-2xl overflow-hidden mb-4 bg-slate-950">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-950/80 backdrop-blur-md text-cyan-400 border border-cyan-500/30">
                      {item.category}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between gap-2 text-xs text-slate-500 font-mono mb-2">
                  <span className="text-cyan-400 font-semibold">{item.source || "NeuroWire Bureau"}</span>
                  <span>{item.readTime}</span>
                </div>

                <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors mb-2 leading-snug">
                  {item.title}
                </h3>

                <p className="text-xs text-slate-400 line-clamp-3 mb-4 leading-relaxed">
                  {item.summary}
                </p>
              </div>

              <div className="border-t border-slate-800 pt-3 flex flex-wrap items-center justify-between gap-2">
                <button
                  onClick={() => setActiveModal({ type: "full", item })}
                  className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-xl bg-cyan-950/80 text-cyan-300 border border-cyan-800/40 hover:bg-cyan-900/60 font-semibold"
                >
                  <BookOpen className="h-3.5 w-3.5" /> Full Story
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setActiveModal({ type: "summary", item })}
                    className="p-1.5 rounded-xl bg-slate-800 text-slate-300 border border-slate-700 hover:text-cyan-400"
                    title="Key Points"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                  </button>

                  <button
                    onClick={() => toggleSpeech(item)}
                    className={`p-1.5 rounded-xl border ${
                      readingId === item.id ? "bg-cyan-500 text-black border-cyan-400" : "bg-slate-800 text-slate-300 border-slate-700 hover:text-cyan-400"
                    }`}
                    title="Listen with AI Voice"
                  >
                    {readingId === item.id ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. TOOLS DIRECTORY */}
      <section id="tools" className="max-w-7xl mx-auto px-4 py-10">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
          <Cpu className="h-6 w-6 text-cyan-400" /> Trending AI Tools
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {AI_TOOLS.map((tool, idx) => (
            <div key={idx} className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5">
              <span className="text-[10px] uppercase font-bold text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
                {tool.tag}
              </span>
              <h3 className="text-base font-bold text-white mt-2 mb-1">{tool.name}</h3>
              <p className="text-xs text-slate-400 mb-4">{tool.desc}</p>
              <button className="flex items-center justify-center gap-1.5 w-full text-xs font-semibold py-2 rounded-xl bg-slate-800 text-slate-200">
                Explore Tool <ArrowUpRight className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* 6. FOOTER */}
      <footer className="border-t border-slate-800 bg-slate-950 py-8">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-lg font-bold text-white">Neuro<span className="text-cyan-400">Wire</span></span>
          <div className="flex gap-4 text-slate-400">
            <a href="#" className="p-2 bg-slate-900 rounded-full hover:text-cyan-400"><Share2 className="h-4 w-4" /></a>
            <a href="#" className="p-2 bg-slate-900 rounded-full hover:text-red-400"><Video className="h-4 w-4" /></a>
            <a href="#" className="p-2 bg-slate-900 rounded-full hover:text-white"><Globe className="h-4 w-4" /></a>
            <a href="#" className="p-2 bg-slate-900 rounded-full hover:text-blue-400"><MessageSquare className="h-4 w-4" /></a>
          </div>
        </div>
        <p className="text-center text-xs text-slate-600 mt-4">© 2026 NeuroWire. In-depth reports with verified media sources.</p>
      </footer>

      {/* 7. FULL ARTICLE & SUMMARY MODAL */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-2xl w-full p-6 relative my-8 shadow-2xl max-h-[85vh] overflow-y-auto">
            <button
              onClick={() => setActiveModal(null)}
              className="sticky top-0 float-right p-2 text-slate-400 hover:text-white rounded-full bg-slate-800 z-20"
            >
              <X className="h-4 w-4" />
            </button>

            {activeModal.type === "full" ? (
              <div className="space-y-4">
                {activeModal.item.image && (
                  <div className="h-48 w-full rounded-2xl overflow-hidden mb-4">
                    <img src={activeModal.item.image} alt={activeModal.item.title} className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
                  <span className="px-2.5 py-0.5 rounded-full bg-cyan-950 border border-cyan-800">
                    Source: {activeModal.item.source || "NeuroWire Tech Desk"}
                  </span>
                  <span>• {activeModal.item.readTime}</span>
                </div>

                <h2 className="text-xl md:text-2xl font-bold text-white leading-snug">
                  {activeModal.item.title}
                </h2>

                <div className="space-y-3 text-sm text-slate-300 leading-relaxed pt-2 border-t border-slate-800">
                  {(activeModal.item.fullArticle || activeModal.item.summary)
                    .split("\n\n")
                    .map((paragraph, idx) => (
                      <p key={idx}>{paragraph}</p>
                    ))}
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 mt-6">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 mb-2">Key Takeaways</h4>
                  <ul className="space-y-1.5">
                    {activeModal.item.bullets.map((b, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-slate-300">
                        <CheckCircle2 className="h-3.5 w-3.5 text-cyan-400 shrink-0 mt-0.5" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <h3 className="text-lg font-bold text-white">{activeModal.item.title}</h3>
                <ul className="space-y-2">
                  {activeModal.item.bullets.map((b, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                      <CheckCircle2 className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 8. REAL LIVE GEMINI AI CHAT ASSISTANT */}
      <div className="fixed bottom-6 right-6 z-50">
        {!chatOpen ? (
          <button
            onClick={() => setChatOpen(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-indigo-600 text-white px-5 py-3.5 rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all font-semibold text-sm"
          >
            <Bot className="h-5 w-5" /> NeuroWire AI
          </button>
        ) : (
          <div className="w-80 sm:w-96 bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col h-[460px] overflow-hidden">
            <div className="bg-slate-950 p-3.5 border-b border-slate-800 flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-2">
                <Bot className="h-4 w-4 text-cyan-400" /> NeuroWire Intelligence
              </span>
              <button onClick={() => setChatOpen(false)}><X className="h-4 w-4 text-slate-400" /></button>
            </div>

            <div className="flex-1 p-3.5 overflow-y-auto space-y-2.5 text-xs">
              {chatMessages.map((msg, i) => (
                <div key={i} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[85%] p-3 rounded-2xl ${
                      msg.sender === "user" ? "bg-cyan-600 text-white rounded-br-none" : "bg-slate-800 text-slate-200 rounded-bl-none border border-slate-700"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              {isAiReplying && (
                <div className="flex justify-start">
                  <div className="bg-slate-800 text-cyan-400 p-2.5 rounded-xl text-xs animate-pulse">
                    Gemini AI is analyzing...
                  </div>
                </div>
              )}
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="p-2.5 bg-slate-950 border-t border-slate-800 flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask NeuroWire Intelligence..."
                className="flex-1 bg-slate-900 border border-slate-800 rounded-full px-3.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
              <button type="submit" disabled={isAiReplying} className="p-2 rounded-full bg-cyan-500 text-black">
                <Send className="h-3.5 w-3.5" />
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
