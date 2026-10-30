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
  Share2,
  Globe,
  Video,
  MessageSquare,
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
}

const CRYPTO_PRICES = [
  { pair: "BTC/USDT", price: "$98,450.20", change: "+3.4%" },
  { pair: "ETH/USDT", price: "$3,620.80", change: "+2.1%" },
  { pair: "SOL/USDT", price: "$235.40", change: "+6.8%" },
  { pair: "RENDER/USDT", price: "$11.15", change: "+12.4%" },
];

const NEWS_DATA: NewsItem[] = [
  {
    id: "1",
    title: "Autonomous AI Agents Secure Decentralized Finance Protocols via Smart Contracts",
    category: "Crypto",
    readTime: "4 min read",
    timeAgo: "20 min ago",
    summary:
      "New autonomous AI systems audit Web3 smart contracts in real-time, preventing multi-million dollar exploits before transactions confirm on-chain.",
    simpleExplanation:
      "Socho ek smart computer guard hai jo crypto banks mein chori hone se pehle hi chor ko pakad leta hai.",
    bullets: [
      "Zero-second latency vulnerability detection on Ethereum & Solana.",
      "Over $45M in exploits prevented in closed beta trials.",
      "Decentralized nodes incentivize AI validators with crypto tokens.",
    ],
  },
  {
    id: "2",
    title: "Next-Gen Quantum-Resistant LLM Architecture Achieves Humanoid Reasoning",
    category: "AI",
    readTime: "6 min read",
    timeAgo: "1 hour ago",
    summary:
      "A breakthrough neural network structure utilizes hybrid neuromorphic computing, slashing energy consumption by 70%.",
    simpleExplanation:
      "Aisa naya dimag wala AI jo bijli bohat kam leta hai lekin insanon jaisi mushkil reasoning asani se kar leta hai.",
    bullets: [
      "70% lower energy requirements compared to standard GPU clusters.",
      "Outperformed top models in multi-step scientific problem solving.",
      "Open-weights release scheduled for academic institutions.",
    ],
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
      "Dunya bhar ke banks mil kar aisa software chala rahe hain jis se paise 1 second mein transfer honge.",
    bullets: [
      "Settlement speed slashed from 3 days to under 2 seconds.",
      "Integrated with both fiat currency and compliant stablecoins.",
      "Pilot test processing over $1B in weekly transaction volume.",
    ],
  },
];

const AI_TOOLS = [
  { name: "NeuralForge 3.0", desc: "Autonomous full-stack web developer agent.", tag: "Dev Tool", badge: "Trending" },
  { name: "CryptoPulse AI", desc: "Real-time on-chain anomaly detector dashboard.", tag: "Web3 Analytics", badge: "New" },
  { name: "VoiceMesh Pro", desc: "Ultra-realistic zero-shot multi-language voice cloner.", tag: "Audio Gen", badge: "Hot" },
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
  const [chatMessages, setChatMessages] = useState<{ sender: "user" | "ai"; text: string }[]>([
    { sender: "ai", text: "👋 Hi! Welcome to NeuroWire. Ask me anything about AI or crypto!" },
  ]);
  const [chatInput, setChatInput] = useState("");

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

  const handleSendMessage = (customMsg?: string) => {
    const textToSend = customMsg || chatInput;
    if (!textToSend.trim()) return;

    setChatMessages((prev) => [...prev, { sender: "user", text: textToSend }]);
    if (!customMsg) setChatInput("");

    setTimeout(() => {
      let reply = "NeuroWire AI detects high growth in decentralized AI models and Web3 infrastructure.";
      const lower = textToSend.toLowerCase();
      if (lower.includes("llm") || lower.includes("explain")) {
        reply = "Large Language Models (LLMs) are deep-learning models trained to process and generate language and code.";
      } else if (lower.includes("crypto") || lower.includes("btc")) {
        reply = "Crypto markets are seeing strong institutional inflows into AI tokens and scalable blockchains.";
      }
      setChatMessages((prev) => [...prev, { sender: "ai", text: reply }]);
    }, 600);
  };

  const filteredNews = NEWS_DATA.filter((item) => {
    const matchesCategory = activeCategory === "All" || item.category === activeCategory;
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.summary.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 font-sans antialiased">
      {/* 1. TOP LIVE CRYPTO TICKER */}
      <div className="bg-slate-950 border-b border-slate-800 py-2 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-cyan-400 font-semibold uppercase shrink-0 pr-4 border-r border-slate-800">
            <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse"></span> Live Ticker
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
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="text-2xl font-black text-white">
                Neuro<span className="text-cyan-400">Wire</span>
              </span>
              <p className="text-[10px] uppercase text-slate-400 font-mono">AI & Web3 Intelligence</p>
            </div>
          </div>

          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search breakthroughs or tokens..."
              className="w-full bg-slate-950 border border-slate-800 rounded-full pl-9 pr-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <nav className="flex items-center gap-6 text-sm text-slate-300">
            <a href="#hero" className="hover:text-cyan-400">Home</a>
            <a href="#news" className="hover:text-cyan-400">News Feed</a>
            <a href="#tools" className="hover:text-cyan-400">Tools</a>
          </nav>
        </div>
      </header>

      {/* 3. HERO SECTION */}
      <section id="hero" className="max-w-7xl mx-auto px-4 pt-8 pb-10">
        <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 md:p-8 space-y-4 shadow-2xl">
          <span className="bg-red-500/20 text-red-400 border border-red-500/40 text-xs px-3 py-1 rounded-full font-bold uppercase">
            ● Breaking Dispatch
          </span>
          <h1 className="text-2xl md:text-4xl font-extrabold text-white leading-tight">
            Frontier Supercluster Model Breaches General Autonomy Threshold in Scientific Logic
          </h1>
          <div className="bg-slate-950 border border-cyan-500/30 rounded-2xl p-4">
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold uppercase mb-1">
              <Sparkles className="h-3.5 w-3.5" /> AI Executive Summary
            </div>
            <p className="text-sm text-slate-300">
              Leading frontier laboratories confirm a milestone model capable of autonomously writing and verifying mathematical proofs.
            </p>
          </div>
        </div>
      </section>

      {/* 4. NEWS FEED */}
      <section id="news" className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h2 className="text-2xl font-bold text-white">Intelligence Wire</h2>
          <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-full border border-slate-800">
            {["All", "AI", "Crypto"].map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold ${
                  activeCategory === cat ? "bg-cyan-500 text-black" : "text-slate-400"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredNews.map((item) => (
            <div key={item.id} className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 flex flex-col justify-between">
              <div>
                <span className="px-3 py-1 rounded-full text-[11px] font-bold uppercase bg-slate-800 text-cyan-400">
                  {item.category}
                </span>
                <h3 className="text-lg font-bold text-white mt-3 mb-2">{item.title}</h3>
                <p className="text-sm text-slate-400 mb-6">{item.summary}</p>
              </div>

              <div className="border-t border-slate-800 pt-4 flex items-center justify-between">
                <div className="flex gap-2">
                  <button
                    onClick={() => setActiveModal({ type: "summary", item })}
                    className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl bg-slate-800 text-cyan-300 border border-slate-700"
                  >
                    <Sparkles className="h-3.5 w-3.5 text-cyan-400" /> Summary
                  </button>
                  <button
                    onClick={() => setActiveModal({ type: "simple", item })}
                    className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl bg-slate-800 text-indigo-300 border border-slate-700"
                  >
                    <Bot className="h-3.5 w-3.5 text-indigo-400" /> Explain
                  </button>
                </div>

                <button
                  onClick={() => toggleSpeech(item)}
                  className={`p-2 rounded-xl border ${
                    readingId === item.id ? "bg-cyan-500 text-black border-cyan-400" : "bg-slate-800 text-slate-300 border-slate-700"
                  }`}
                >
                  {readingId === item.id ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </button>
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
        <p className="text-center text-xs text-slate-600 mt-4">© 2026 NeuroWire. All rights reserved.</p>
      </footer>

      {/* 7. AI MODAL */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full p-6 relative">
            <button onClick={() => setActiveModal(null)} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white">
              <X className="h-4 w-4" />
            </button>
            <h3 className="text-lg font-bold text-white mb-3">{activeModal.item.title}</h3>
            {activeModal.type === "summary" ? (
              <ul className="space-y-2">
                {activeModal.item.bullets.map((b, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                    <CheckCircle2 className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-4 rounded-xl bg-indigo-950/30 border border-indigo-500/20 text-slate-200 text-sm">
                {activeModal.item.simpleExplanation}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 8. AI CHAT ASSISTANT */}
      <div className="fixed bottom-6 right-6 z-50">
        {!chatOpen ? (
          <button
            onClick={() => setChatOpen(true)}
            className="flex items-center gap-2 bg-cyan-500 text-black px-5 py-3 rounded-full font-bold text-sm shadow-xl"
          >
            <Bot className="h-5 w-5" /> NeuroWire AI
          </button>
        ) : (
          <div className="w-80 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col h-[420px] overflow-hidden">
            <div className="bg-slate-950 p-3 border-b border-slate-800 flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-2">
                <Bot className="h-4 w-4 text-cyan-400" /> NeuroWire Assistant
              </span>
              <button onClick={() => setChatOpen(false)}><X className="h-4 w-4 text-slate-400" /></button>
            </div>
            <div className="flex-1 p-3 overflow-y-auto space-y-2 text-xs">
              {chatMessages.map((msg, i) => (
                <div key={i} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`p-2.5 rounded-xl ${msg.sender === "user" ? "bg-cyan-600 text-white" : "bg-slate-800 text-slate-200"}`}>
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>
            <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="p-2 bg-slate-950 border-t border-slate-800 flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask AI..."
                className="flex-1 bg-slate-900 border border-slate-800 rounded-full px-3 py-1.5 text-xs text-white"
              />
              <button type="submit" className="p-2 rounded-full bg-cyan-500 text-black"><Send className="h-3 w-3" /></button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
