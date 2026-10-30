"use client";

import React, { useState } from "react";
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
  Mail,
  CheckCircle2,
  Youtube,
  Twitter,
  Github,
  Linkedin,
} from "lucide-react";

interface NewsItem {
  id: string;
  title: string;
  category: "AI" | "Crypto" | "Tools";
  readTime: string;
  timeAgo: string;
  summary: string;
  simpleExplanation: string;
  bullets: string[];
  image: string;
}

const CRYPTO_PRICES = [
  { pair: "BTC/USDT", price: "$98,450.20", change: "+3.4%" },
  { pair: "ETH/USDT", price: "$3,620.80", change: "+2.1%" },
  { pair: "SOL/USDT", price: "$235.40", change: "+6.8%" },
  { pair: "RENDER/USDT", price: "$11.15", change: "+12.4%" },
  { pair: "NEAR/USDT", price: "$7.80", change: "+4.2%" },
];

const NEWS_DATA: NewsItem[] = [
  {
    id: "1",
    title: "Autonomous AI Agents Secure Decentralized Finance Protocols via Smart Contracts",
    category: "Crypto",
    readTime: "4 min read",
    timeAgo: "20 min ago",
    summary:
      "New autonomous AI systems are now auditing Web3 smart contracts in real-time, preventing multi-million dollar exploits before transactions confirm on-chain.",
    simpleExplanation:
      "Socho ek smart computer guard hai jo crypto banks mein chori hone se pehle hi chor ko pakad leta hai.",
    bullets: [
      "Zero-second latency vulnerability detection on Ethereum & Solana.",
      "Over $45M in exploits prevented in closed beta trials.",
      "Decentralized nodes incentivize AI validators with crypto tokens.",
    ],
    image: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: "2",
    title: "Next-Gen Quantum-Resistant LLM Architecture Achieves Humanoid Reasoning",
    category: "AI",
    readTime: "6 min read",
    timeAgo: "1 hour ago",
    summary:
      "A breakthrough neural network structure utilizes hybrid neuromorphic computing, slashing energy consumption by 70% while setting new benchmarks.",
    simpleExplanation:
      "Aisa naya dimag wala AI jo bijli bohat kam leta hai lekin insanon jaisi mushkil reasoning asani se kar leta hai.",
    bullets: [
      "70% lower energy requirements compared to standard GPU clusters.",
      "Outperformed top models in multi-step scientific problem solving.",
      "Open-weights release scheduled for academic institutions.",
    ],
    image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: "3",
    title: "Global Central Banks Partner on Unified AI-Driven Cross-Border Settlement",
    category: "Crypto",
    readTime: "3 min read",
    timeAgo: "3 hours ago",
    summary:
      "Six major central banks launch a unified ledger system testing instant cross-border payments with predictive liquidity routing.",
    simpleExplanation:
      "Dunya bhar ke banks mil kar ek aisa software chala rahe hain jis se paise 1 second mein bina kisi extra fee ke transfer honge.",
    bullets: [
      "Settlement speed slashed from 3 days to under 2 seconds.",
      "Integrated with both fiat currency and compliant stablecoins.",
      "Pilot test processing over $1B in weekly transaction volume.",
    ],
    image: "https://images.unsplash.com/photo-1621416894569-0f39ed31d247?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: "4",
    title: "Multimodal AI Transforms Real-Time Video Generation with Zero Latency",
    category: "Tools",
    readTime: "5 min read",
    timeAgo: "5 hours ago",
    summary:
      "Creators can now stream 4K AI-synthesized interactive environments directly from browser prompts with zero rendering lag.",
    simpleExplanation:
      "Ab aap jo type karenge, foran uski 4K movie screen par live chalna shuru ho jayegi.",
    bullets: [
      "Real-time 60fps streaming generation on consumer hardware.",
      "Native voice-prompt guidance with direct camera control.",
      "Exportable directly into Unreal Engine and 3D web environments.",
    ],
    image: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=800&auto=format&fit=crop",
  },
];

const AI_TOOLS = [
  {
    name: "NeuralForge 3.0",
    desc: "Autonomous full-stack web developer agent that writes and deploys code.",
    tag: "Dev Tool",
    badge: "Trending",
  },
  {
    name: "CryptoPulse AI",
    desc: "Real-time on-chain anomaly detector and sentiment analysis dashboard.",
    tag: "Web3 Analytics",
    badge: "New",
  },
  {
    name: "VoiceMesh Pro",
    desc: "Ultra-realistic zero-shot multi-language voice cloner with emotion controls.",
    tag: "Audio Gen",
    badge: "Hot",
  },
];

export default function NeuroWirePlatform() {
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [readingId, setReadingId] = useState<string | null>(null);

  const [activeModal, setActiveModal] = useState<{
    type: "summary" | "simple";
    item: NewsItem;
  } | null>(null);

  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<
    { sender: "user" | "ai"; text: string }[]
  >([
    {
      sender: "ai",
      text: "👋 Hi! Welcome to NeuroWire. Ask me anything about today's AI breakthroughs or crypto markets!",
    },
  ]);
  const [chatInput, setChatInput] = useState("");

  const toggleSpeech = (item: NewsItem) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      alert("Audio reader is not supported on this browser.");
      return;
    }

    if (readingId === item.id) {
      window.speechSynthesis.cancel();
      setReadingId(null);
    } else {
      window.speechSynthesis.cancel();
      const textToRead = `${item.title}. Summary: ${item.summary}`;
      const utterance = new SpeechSynthesisUtterance(textToRead);
      utterance.onend = () => setReadingId(null);
      utterance.onerror = () => setReadingId(null);
      window.speechSynthesis.speak(utterance);
      setReadingId(item.id);
    }
  };

  const handleSendMessage = (customMsg?: string) => {
    const textToSend = customMsg || chatInput;
    if (!textToSend.trim()) return;

    setChatMessages((prev) => [...prev, { sender: "user", text: textToSend }]);
    if (!customMsg) setChatInput("");

    setTimeout(() => {
      let reply = "NeuroWire algorithms detect surging interest in open-weights frontier AI and decentralized compute layers.";
      const lower = textToSend.toLowerCase();
      if (lower.includes("llm") || lower.includes("explain")) {
        reply = "Large Language Models (LLMs) are neural networks trained to understand, generate, and reason through human language and software code.";
      } else if (lower.includes("crypto") || lower.includes("btc")) {
        reply = "Crypto markets are seeing bullish liquidity rotations into AI tokens and high-throughput layer-1 blockchains.";
      }
      setChatMessages((prev) => [...prev, { sender: "ai", text: reply }]);
    }, 600);
  };

  const filteredNews = NEWS_DATA.filter((item) => {
    const matchesCategory =
      activeCategory === "All" || item.category === activeCategory;
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.summary.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 font-sans antialiased selection:bg-cyan-500 selection:text-black">
      {/* 1. TOP LIVE CRYPTO TICKER */}
      <div className="bg-slate-950/90 border-b border-slate-800/60 py-2 overflow-hidden sticky top-0 z-50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-cyan-400 font-semibold tracking-wider uppercase shrink-0 pr-4 border-r border-slate-800">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
            </span>
            Live Ticker
          </div>
          <div className="flex items-center gap-8 overflow-x-auto no-scrollbar scroll-smooth whitespace-nowrap pl-4">
            {CRYPTO_PRICES.map((c, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-slate-400 font-medium">{c.pair}</span>
                <span className="font-semibold text-slate-200">{c.price}</span>
                <span className="text-emerald-400 text-[11px] font-mono bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-800/40">
                  {c.change}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 2. MAIN NAVBAR WITH NEUROWIRE LOGO */}
      <header className="border-b border-slate-800/80 bg-slate-900/40 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="text-2xl font-black tracking-tight text-white flex items-center gap-1">
                Neuro<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400">Wire</span>
              </span>
              <p className="text-[10px] uppercase tracking-widest text-slate-400 font-mono -mt-1">
                Frontier Intelligence & Web3 Wire
              </p>
            </div>
          </div>

          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search AI breakthroughs or tokens..."
              className="w-full bg-slate-950/80 border border-slate-800 rounded-full pl-9 pr-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-500/80 transition-all placeholder:text-slate-500"
            />
          </div>

          <nav className="flex items-center gap-6 text-sm font-medium text-slate-300">
            <a href="#hero" className="hover:text-cyan-400 transition-colors">Home</a>
            <a href="#news" className="hover:text-cyan-400 transition-colors">Intelligence Wire</a>
            <a href="#tools" className="hover:text-cyan-400 transition-colors">Tools</a>
            <a href="#creator" className="hover:text-cyan-400 transition-colors">About</a>
          </nav>
        </div>
      </header>

      {/* 3. HERO SECTION */}
      <section id="hero" className="max-w-7xl mx-auto px-4 pt-8 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 relative rounded-3xl overflow-hidden border border-slate-800 bg-slate-900/60 p-6 md:p-8 flex flex-col justify-end min-h-[440px] group shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-t from-[#070b14] via-[#070b14]/70 to-transparent z-10" />
            <img
              src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop"
              alt="NeuroWire Exclusive"
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-40"
            />

            <div className="relative z-20 space-y-4">
              <div className="flex items-center gap-3">
                <span className="bg-red-500/20 text-red-400 border border-red-500/40 text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider animate-pulse flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-red-400 rounded-full" /> NeuroWire Dispatch
                </span>
                <span className="text-xs text-slate-400 font-mono">5 min read</span>
              </div>

              <h1 className="text-2xl md:text-4xl font-extrabold text-white leading-tight">
                Frontier Supercluster Model Breaches General Autonomy Threshold in Scientific Logic
              </h1>

              <div className="bg-slate-900/80 backdrop-blur-md border border-cyan-500/30 rounded-2xl p-4 max-w-2xl">
                <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-1">
                  <Sparkles className="h-3.5 w-3.5" /> AI Executive Summary
                </div>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Leading frontier laboratories confirm a milestone multimodal model capable of autonomously writing, verifying, and publishing peer-reviewed mathematical proofs.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-cyan-400" /> Trending Wire
              </h3>
              <span className="text-xs text-cyan-400 font-mono">Real-Time</span>
            </div>

            {NEWS_DATA.slice(0, 3).map((item) => (
              <div
                key={item.id}
                className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-4 hover:border-cyan-500/40 hover:bg-slate-900/80 transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-cyan-300 font-mono text-[10px]">
                    {item.category}
                  </span>
                  <span>• {item.timeAgo}</span>
                </div>
                <h4 className="text-sm font-semibold text-slate-200 group-hover:text-cyan-300 transition-colors line-clamp-2">
                  {item.title}
                </h4>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. ADSENSE BANNER */}
      <div className="max-w-7xl mx-auto px-4 mb-10">
        <div className="w-full h-24 border border-dashed border-slate-800 rounded-2xl bg-slate-950/40 flex flex-col items-center justify-center text-slate-600 text-xs uppercase tracking-widest font-mono">
          <span>[ NeuroWire Sponsored Space - 728x90 ]</span>
          <span className="text-[10px] text-slate-700 mt-1">Monetization Ready Layout</span>
        </div>
      </div>

      {/* 5. NEWS FEED */}
      <section id="news" className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Intelligence Wire</h2>
            <p className="text-sm text-slate-400">Curated feeds with AI summary companion</p>
          </div>

          <div className="flex items-center gap-2 bg-slate-950/80 p-1.5 rounded-full border border-slate-800">
            {["All", "AI", "Crypto", "Tools"].map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  activeCategory === cat
                    ? "bg-cyan-500 text-black shadow-md shadow-cyan-500/20"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {cat === "All" ? "All Streams" : cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredNews.map((item) => (
            <div
              key={item.id}
              className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 hover:border-slate-700 transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-4">
                  <span className="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-slate-800/80 text-cyan-400 border border-cyan-500/20">
                    {item.category}
                  </span>
                  <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
                    <span>{item.readTime}</span>
                    <span>•</span>
                    <span>{item.timeAgo}</span>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-slate-100 group-hover:text-cyan-300 transition-colors mb-3 leading-snug">
                  {item.title}
                </h3>

                <p className="text-sm text-slate-400 leading-relaxed mb-6">
                  {item.summary}
                </p>
              </div>

              <div className="border-t border-slate-800/80 pt-4 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveModal({ type: "summary", item })}
                    className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-xl bg-slate-800 text-cyan-300 hover:bg-cyan-950/60 hover:border-cyan-500/50 border border-slate-700 transition-all"
                  >
                    <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
                    3-Point Summary
                  </button>

                  <button
                    onClick={() => setActiveModal({ type: "simple", item })}
                    className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-xl bg-slate-800 text-indigo-300 hover:bg-indigo-950/60 hover:border-indigo-500/50 border border-slate-700 transition-all"
                  >
                    <Bot className="h-3.5 w-3.5 text-indigo-400" />
                    Explain Simple
                  </button>
                </div>

                <button
                  onClick={() => toggleSpeech(item)}
                  className={`p-2 rounded-xl border transition-all ${
                    readingId === item.id
                      ? "bg-cyan-500 text-black border-cyan-400 animate-pulse"
                      : "bg-slate-800/80 text-slate-300 border-slate-700 hover:text-cyan-400"
                  }`}
                  title="Listen with AI Voice"
                >
                  {readingId === item.id ? (
                    <VolumeX className="h-4 w-4" />
                  ) : (
                    <Volume2 className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. AI TOOLS */}
      <section id="tools" className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2 mb-6">
          <Cpu className="h-6 w-6 text-cyan-400" /> Trending AI Tools Directory
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {AI_TOOLS.map((tool, idx) => (
            <div
              key={idx}
              className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 hover:border-cyan-500/40 hover:bg-slate-900/70 transition-all flex flex-col justify-between"
            >
              <div>
             <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-mono uppercase bg-cyan-950/80 text-cyan-400 px-2.5 py-0.5 rounded border border-cyan-800/40">
                    {tool.tag}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-800/40">
                    {tool.badge}
                  </span>
                </div>
                <h3 className="text-base font-bold text-white mb-1.5">{tool.name}</h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">{tool.desc}</p>
              </div>
              <button className="flex items-center justify-center gap-1.5 w-full text-xs font-semibold py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors">
                Explore Tool <ArrowUpRight className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* 7. NEWSLETTER */}
      <section className="max-w-7xl mx-auto px-4 py-10">
        <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/30 p-8 md:p-12 text-center max-w-4xl mx-auto shadow-2xl">
          <Mail className="h-10 w-10 text-cyan-400 mx-auto mb-4" />
          <h2 className="text-3xl font-black text-white mb-2">Subscribe to NeuroWire Daily</h2>
          <p className="text-sm text-slate-400 max-w-xl mx-auto mb-6">
            Get 3 curated AI discoveries and crypto market movements delivered directly to you.
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              alert("Subscribed to NeuroWire briefings!");
            }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto"
          >
            <input
              type="email"
              required
              placeholder="Enter your email..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-cyan-400"
            />
            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 font-bold text-black text-sm transition-all shadow-lg shadow-cyan-500/20"
            >
              Subscribe
            </button>
          </form>
        </div>
      </section>

      {/* 8. FOOTER WITH NEUROWIRE BRAND */}
      <footer id="creator" className="border-t border-slate-800 bg-slate-950 pt-12 pb-8">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-slate-900">
          <div>
            <span className="text-lg font-bold text-white">Neuro<span className="text-cyan-400">Wire</span></span>
            <p className="text-xs text-slate-500 mt-1">
              Independent publication monitoring AI developments & Web3 infrastructure.
            </p>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <a href="#" className="p-2.5 rounded-full bg-slate-900 hover:text-cyan-400 transition-all"><Twitter className="h-4 w-4" /></a>
            <a href="#" className="p-2.5 rounded-full bg-slate-900 hover:text-red-400 transition-all"><Youtube className="h-4 w-4" /></a>
            <a href="#" className="p-2.5 rounded-full bg-slate-900 hover:text-white transition-all"><Github className="h-4 w-4" /></a>
            <a href="#" className="p-2.5 rounded-full bg-slate-900 hover:text-blue-400 transition-all"><Linkedin className="h-4 w-4" /></a>
          </div>
        </div>
        <p className="text-center text-xs text-slate-600 mt-6">© 2026 NeuroWire. All rights reserved.</p>
      </footer>

      {/* 9. AI MODAL */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full p-6 relative shadow-2xl">
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800"
            >
              <X className="h-4 w-4" />
            </button>

            {activeModal.type === "summary" ? (
              <div>
                <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono uppercase mb-2">
                  <Sparkles className="h-4 w-4" /> 3-Bullet AI Summary
                </div>
                <h3 className="text-lg font-bold text-white mb-4">{activeModal.item.title}</h3>
                <ul className="space-y-3">
                  {activeModal.item.bullets.map((b, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-slate-300">
                      <CheckCircle2 className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-2 text-indigo-400 text-xs font-mono uppercase mb-2">
                  <Bot className="h-4 w-4" /> Explain in Simple Terms
                </div>
                <h3 className="text-lg font-bold text-white mb-3">{activeModal.item.title}</h3>
                <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/20 text-slate-200 text-sm leading-relaxed">
                  {activeModal.item.simpleExplanation}
                </div>
              </div>
            )}

            <button
              onClick={() => setActiveModal(null)}
              className="w-full mt-6 py-2.5 rounded-xl bg-slate-800 text-slate-200 font-medium text-xs transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* 10. NEUROWIRE AI ASSISTANT CHAT WIDGET */}
      <div className="fixed bottom-6 right-6 z-50">
        {!chatOpen ? (
          <button
            onClick={() => setChatOpen(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-indigo-600 text-white px-5 py-3.5 rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all font-semibold text-sm"
          >
            <Bot className="h-5 w-5" />
            <span>NeuroWire AI</span>
          </button>
        ) : (
          <div className="w-80 sm:w-96 bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col h-[480px] overflow-hidden">
            <div className="bg-slate-950 p-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bot className="h-4 w-4 text-cyan-400" />
                <h4 className="text-xs font-bold text-white">NeuroWire Assistant</h4>
              </div>
              <button onClick={() => setChatOpen(false)} className="text-slate-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs">
              {chatMessages.map((msg, i) => (
                <div key={i} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[80%] p-3 rounded-2xl ${
                      msg.sender === "user" ? "bg-cyan-600 text-white" : "bg-slate-800 text-slate-200 border border-slate-700"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2"
            >
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask NeuroWire AI..."
                className="flex-1 bg-slate-900 border border-slate-800 rounded-full px-3.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
              <button type="submit" className="p-2 rounded-full bg-cyan-500 text-black">
                <Send className="h-3.5 w-3.5" />
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
      }
