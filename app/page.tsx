"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "./supabase";
import {
  TrendingUp,
  Volume2,
  VolumeX,
  Search,
  X,
  Zap,
  Plus,
  Cpu,
  CheckCircle2,
  Share2,
  Globe,
  Video,
  MessageSquare,
  BookOpen,
} from "lucide-react";

interface NewsItem {
  id: string;
  title: string;
  category: "AI" | "Crypto" | "Policy";
  source: string;
  readTime: string;
  publishedAt: string;
  image: string;
  summary: string;
  fullReport: string[];
  bullets: string[];
}

const CRYPTO_PRICES = [
  { pair: "BTC/USDT", price: "$98,450.20", change: "+3.4%" },
  { pair: "ETH/USDT", price: "$3,620.80", change: "+2.1%" },
  { pair: "SOL/USDT", price: "$235.40", change: "+6.8%" },
  { pair: "NVDA (AI Index)", price: "$142.10", change: "+4.9%" },
];

const INITIAL_NEWS: NewsItem[] = [
  {
    id: "1",
    title: "Global Regulators Fast-Track Sovereign Digital Asset Reserves Following High-Level Policy Talks",
    category: "Crypto",
    source: "Reuters Financial Wire",
    readTime: "7 min read",
    publishedAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    image: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=800&auto=format&fit=crop",
    summary: "Finance ministers and central bank governors across G20 nations have drafted framework guidelines designating transparent digital assets as strategic reserve instruments alongside gold.",
    fullReport: [
      "In a historic shift for sovereign financial architecture, delegates representing multiple G20 financial ministries have advanced preliminary language recognising high-liquidity digital assets within state asset reserves.",
      "The catalyst stems from accelerated bilateral discussions in Washington and Brussels, where policymakers have increasingly sought inflation hedges insulated from single-currency debt degradation.",
      "According to draft documentation, central treasuries would maintain custodial keys in multi-signatory state vaults, audited continuously on decentralized ledgers rather than relying on delayed quarterly balance sheets.",
      "Wall Street institutional custodians noted an immediate surge in OTC inquiries from sovereign wealth funds, with major desk traders reporting block volumes that outpaced typical institutional averages.",
    ],
    bullets: [
      "G20 working group drafts strategic reserve framework integrating high-tier digital assets.",
      "Multi-signatory cold storage protocols prioritized over legacy correspondent custodians.",
      "Institutional OTC desks register record sovereign wealth liquidity inquiries.",
    ],
  },
  {
    id: "2",
    title: "Autonomous Multi-Agent Neural Clusters Outpace Wall Street Quantitative Desks in Live Market Executions",
    category: "AI",
    source: "Bloomberg Technology",
    readTime: "6 min read",
    publishedAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop",
    summary: "Tier-one financial firms confirm that new autonomous neural agent architectures have surpassed human-coded algorithmic models in navigating high-volatility liquidity shocks.",
    fullReport: [
      "Leading global market makers have disclosed that multi-agent artificial intelligence clusters operating across decentralized liquidity venues generated unprecedented risk-adjusted yields during recent macroeconomic announcements.",
      "Unlike legacy algorithmic models that adhere to rigid historical parameters, these neuromorphic agent networks dynamically negotiate order execution, liquidity routing, and cross-venue hedging simultaneously.",
      "Engineers behind the models credit breakthroughs in energy-efficient local compute, allowing complex multi-step reasoning nodes to co-locate adjacent to transaction matching engines with sub-millisecond execution.",
    ],
    bullets: [
      "Neural multi-agent clusters achieve sub-millisecond execution on high-volatility orders.",
      "Dynamic liquidity routing reduces market slippage by 42% over static algorithms.",
      "Securities regulators launch exploratory oversight frameworks for autonomous trading clusters.",
    ],
  },
  {
    id: "3",
    title: "Bipartisan AI Compute Sovereignty Act Clears Senate: $50B Dedicated to Nuclear-Powered Superclusters",
    category: "Policy",
    source: "CNBC Policy Wire",
    readTime: "8 min read",
    publishedAt: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
    image: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=800&auto=format&fit=crop",
    summary: "Legislation guaranteeing federal energy rights and financial grants for domestic small modular nuclear reactors dedicated exclusively to frontier AI data campuses has passed the US Senate.",
    fullReport: [
      "The United States Senate has overwhelmingly approved comprehensive legislation allocating fifty billion dollars toward domestic AI compute campuses directly energized by dedicated next-generation nuclear reactors.",
      "The bipartisan initiative addresses the acute energy bottleneck confronting frontier technology laboratories, which have projected multi-gigawatt power requirements for training future humanoid reasoning clusters.",
      "Major utility providers and tech consortia have already finalized land permits adjacent to decommissioned industrial facilities.",
    ],
    bullets: [
      "Senate allocates $50B for domestic AI data centers paired with small modular reactors.",
      "Guarantees gigawatt-scale dedicated clean power to eliminate municipal grid competition.",
      "Bipartisan consensus codifies compute capacity as primary national security asset.",
    ],
  },
];
export default function NeuroWirePlatform() {
  const [news, setNews] = useState<NewsItem[]>(INITIAL_NEWS);
  const [activeTab, setActiveTab] = useState<string>("All");
  const [search, setSearch] = useState<string>("");
  const [activeStory, setActiveStory] = useState<NewsItem | null>(null);
  const [isReading, setIsReading] = useState(false);
  const [visibleCount, setVisibleCount] = useState(6);
  const [isAdmin, setIsAdmin] = useState(false);

  // Publish Form State
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [subMessage, setSubMessage] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const sub = localStorage.getItem("neurowire_sub");
      if (sub) setIsSubscribed(true);
    }
  }, []);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      localStorage.setItem("neurowire_sub", "true");
      setIsSubscribed(true);
      setSubMessage("Unlocked successfully!");
    } catch (err) {
      setSubMessage("Error");
    } finally {
      setSubmitting(false);
    }
  };
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState<"AI" | "Crypto" | "Policy">("AI");
  const [newSource, setNewSource] = useState("");
  const [newImage, setNewImage] = useState("");
  const [newSummary, setNewSummary] = useState("");
  const [newArticle, setNewArticle] = useState("");

  // Real Relative Clock Calculator
  const formatTimeAgo = (dateStr?: string) => {
    if (!dateStr) return "Just now";
    try {
      const targetDate = new Date(dateStr);
      const now = new Date();
      const diffInSec = Math.floor((now.getTime() - targetDate.getTime()) / 1000);

      if (isNaN(diffInSec) || diffInSec < 120) return "Just now";

      const mins = Math.floor(diffInSec / 60);
      if (mins < 60) return `${mins}m ago`;

      const hours = Math.floor(mins / 60);
      if (hours < 24) return `${hours}h ago`;

      const days = Math.floor(hours / 24);
      if (days === 1) return "Yesterday";
      if (days < 7) return `${days}d ago`;

      return targetDate.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    } catch {
      return "Recently";
    }
  };

  // Secret Admin & Supabase Sync
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("admin") === "true") {
        setIsAdmin(true);
        localStorage.setItem("neurowire_admin_mode", "true");
      } else if (localStorage.getItem("neurowire_admin_mode") === "true") {
        setIsAdmin(true);
      }
    }

    async function loadVaultNews() {
      try {
        fetch("/api/news").catch(() => {});

        const { data, error } = await supabase
          .from("news")
          .select("*")
          .order("created_at", { ascending: false });

        if (!error && data && data.length > 0) {
          const dbNews: NewsItem[] = data.map((item: any) => ({
            id: item.id.toString(),
            title: item.title,
            category: item.category || "AI",
            source: item.source || "NeuroWire Global Wire",
            readTime: "6 min read",
            publishedAt: item.created_at || new Date().toISOString(),
            image: item.image_url || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop",
            summary: item.description || item.title,
            fullReport: item.content ? item.content.split("\n\n") : [item.description || item.title],
            bullets: ["Verified intelligence dispatch from NeuroWire secure vault."],
          }));
          setNews(dbNews);
        }
      } catch (e) {
        console.log("Vault sync fallback active");
      }
    }

    loadVaultNews();
  }, []);

  // REAL SUPABASE INSERT PUBLISHING
  const handlePublishWire = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newArticle.trim()) return;

    const payload = {
      title: newTitle.trim(),
      description: newSummary.trim() || newArticle.slice(0, 150) + "...",
      content: newArticle,
      image_url: newImage.trim() || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop",
    };

    try {
      await supabase.from("news").insert([payload]);
    } catch (err) {
      console.error("Supabase insert error", err);
    }

    const userStory: NewsItem = {
      id: Date.now().toString(),
      title: payload.title,
      category: newCategory,
      source: newSource.trim() || "NeuroWire Editorial Bureau",
      readTime: "5 min read",
      publishedAt: new Date().toISOString(),
      image: payload.image_url,
      summary: payload.description,
      fullReport: newArticle.split("\n\n").filter((p) => p.trim().length > 0),
      bullets: ["Exclusive scoop filed directly to the NeuroWire global intelligence wire."],
    };

    setNews([userStory, ...news]);
    setNewTitle("");
    setNewSource("");
    setNewImage("");
    setNewSummary("");
    setNewArticle("");
    setShowPublishModal(false);
  };

  const toggleVoiceReader = (story: NewsItem) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    if (isReading) {
      window.speechSynthesis.cancel();
      setIsReading(false);
    } else {
      window.speechSynthesis.cancel();
      const text = `${story.title}. Published by ${story.source}. Overview: ${story.summary}`;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onend = () => setIsReading(false);
      utterance.onerror = () => setIsReading(false);
      window.speechSynthesis.speak(utterance);
      setIsReading(true);
    }
  };

  const filtered = news.filter((item) => {
    const matchesTab = activeTab === "All" || item.category === activeTab;
    const matchesSearch =
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.summary.toLowerCase().includes(search.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const hero = filtered[0] || news[0];

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 font-sans antialiased selection:bg-cyan-500 selection:text-black">
      {/* 1. TICKER */}
      <div className="bg-slate-950 border-b border-slate-800/80 py-2 sticky top-0 z-40 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-cyan-400 font-semibold uppercase shrink-0 pr-4 border-r border-slate-800">
            <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse"></span> 24/7 Global Wire
          </div>
          <div className="flex items-center gap-6 overflow-x-auto whitespace-nowrap pl-4 no-scrollbar">
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
                <footer className="mt-20 border-t border-slate-800 py-8 px-4 text-slate-400 text-sm flex flex-col items-center gap-4">
        <div className="flex items-center gap-4">
          <a href="/privacy" className="hover:text-cyan-400 transition-colors">Privacy Policy</a>
          <span>•</span>
          <a href="/about" className="hover:text-cyan-400 transition-colors">Contact & Editorial Desk</a>
        </div>
        <p className="text-center text-xs text-slate-600">
          © 2026 NeuroWire. All rights reserved.
        </p>
      </footer>
      {/* 6. READER MODAL */}
      {activeStory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-2xl w-full p-6 relative my-8 shadow-2xl max-h-[85vh] overflow-y-auto">
            <button onClick={() => setActiveStory(null)} className="sticky top-0 float-right p-2 text-slate-400 hover:text-white rounded-full bg-slate-800 z-20">
              <X className="h-4 w-4" />
            </button>
            <div className="space-y-4">
              <div className="h-56 w-full rounded-2xl overflow-hidden mb-4">
                <img src={activeStory.image} alt={activeStory.title} className="w-full h-full object-cover" />
              </div>
              <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
                <span className="px-2.5 py-0.5 rounded-full bg-cyan-950 border border-cyan-800">Source: {activeStory.source}</span>
                <span>• {activeStory.readTime}</span>
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-white leading-snug">{activeStory.title}</h2>
              {/* 🔒 SUBSCRIPTION GATE */}
        {!isSubscribed ? (
          <div className="bg-slate-950 border border-cyan-500/30 rounded-2xl p-6 text-center space-y-4 my-6">
            <div className="inline-block p-3 bg-cyan-500/10 rounded-full text-cyan-400 mb-1 text-xl">
              🔒
            </div>
            <h3 className="text-lg font-bold text-white">Unlock Full AI Intelligence Report</h3>
            <p className="text-slate-400 text-sm">
              Enter your email to read the complete in-depth analysis, key takeaways, and live updates for free.
            </p>
            
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
              <input 
                type="email" 
                required
                placeholder="Enter your email address..." 
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
              />
              <button 
                type="submit" 
                disabled={submitting}
                className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold px-5 py-2.5 rounded-xl text-sm transition-all cursor-pointer"
              >
                {submitting ? "Unlocking..." : "Unlock Now"}
              </button>
            </form>
            {subMessage && <p className="text-xs text-cyan-400 mt-2">{subMessage}</p>}
          </div>
        ) : (
          /* ✅ UNLOCKED FULL CONTENT */
          <>
            <div className="space-y-3 text-sm text-slate-300 leading-relaxed pt-2 border-t border-slate-800">
              {activeStory.fullReport.map((paragraph, idx) => (
                <p key={idx}>{paragraph}</p>
              ))}
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 mt-6">
              <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 mb-2">Key Strategic Takeaways</h4>
              <ul className="space-y-1.5">
                {activeStory.bullets.map((b, i) => (
                  <li key={i} className="flex items-start gap-2 text-slate-300 text-sm">
                    <CheckCircle2 className="h-3.5 w-3.5 text-cyan-400 shrink-0 mt-0.5" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}
          </div>
        </div>
      )}
        {/* 7. PUBLISHING MODAL */}
      {showPublishModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full p-6 relative my-8 shadow-2xl">
            <button onClick={() => setShowPublishModal(false)} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800">
              <X className="h-4 w-4" />
            </button>
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Plus className="h-5 w-5 text-cyan-400" /> Publish Exclusive Wire Story
            </h3>
            <form onSubmit={handlePublishWire} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Headline / Title *</label>
                <input type="text" required value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="e.g. SEC Approves First Autonomous AI Agent Treasury Fund..." className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400 block mb-1">Category</label>
                  <select value={newCategory} onChange={(e: any) => setNewCategory(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500">
                    <option value="AI">AI & Compute</option>
                    <option value="Crypto">Crypto & Web3</option>
                    <option value="Policy">Policy & Markets</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Source Name</label>
                  <input type="text" value={newSource} onChange={(e) => setNewSource(e.target.value)} placeholder="e.g. Bloomberg / Reuters / Your Desk" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500" />
                </div>
              </div>
              <div>
                <label className="text-slate-400 block mb-1">HD Photo Link (Optional)</label>
                <input type="url" value={newImage} onChange={(e) => setNewImage(e.target.value)} placeholder="Paste image link..." className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500" />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Quick Summary</label>
                <input type="text" value={newSummary} onChange={(e) => setNewSummary(e.target.value)} placeholder="2 sentences overview..." className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500" />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Full In-Depth Article (25-50 Lines) *</label>
                <textarea required rows={5} value={newArticle} onChange={(e) => setNewArticle(e.target.value)} placeholder="Write the full report here... Double enter for new paragraphs." className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500" />
              </div>
              <button type="submit" className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all mt-2">
                Publish Directly to NeuroWire Live
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
