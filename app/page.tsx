"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "./supabase";
import { useRouter } from "next/navigation";
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

type NewsCategory = "AI" | "Crypto" | "Policy" | "Technology" | "Fox News" | "Leadership";

const NEWS_CATEGORIES: NewsCategory[] = [
  "AI",
  "Crypto",
  "Policy",
  "Technology",
  "Fox News",
  "Leadership",
];

interface NewsItem {
  id: string;
  title: string;
  category: NewsCategory;
  source: string;
  readTime: string;
  publishedAt: string;
  image: string;
  summary: string;
  fullReport: string[];
  bullets: string[];
}

type MarketQuote = {
  symbol: string;
  price: number;
  changePercent: number;
};

const MARKET_SYMBOLS = ["BTCUSDT", "ETHUSDT", "SOLUSDT"] as const;

function formatMarketPrice(value: number): string {
  const formatted = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 6,
  }).format(value);

  return `${formatted} USDT`;
}

export default function NeuroWirePlatform() {
    const router = useRouter();
  const [news, setNews] = useState<NewsItem[]>([]);
  const [newsLoading, setNewsLoading] = useState(true);
  const [marketQuotes, setMarketQuotes] = useState<MarketQuote[]>([]);
  const [marketUpdatedAt, setMarketUpdatedAt] = useState<string | null>(null);
  const [marketStatus, setMarketStatus] = useState<"loading" | "live" | "unavailable">("loading");
  const [activeTab, setActiveTab] = useState<string>("All");
  const [search, setSearch] = useState<string>("");
  const [activeStory, setActiveStory] = useState<NewsItem | null>(null);
  const [isReading, setIsReading] = useState(false);
  const [visibleCount, setVisibleCount] = useState(6);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminStatusLoading, setAdminStatusLoading] = useState(true);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [adminLoginError, setAdminLoginError] = useState("");
  const [publishingError, setPublishingError] = useState("");
  const [isPublishing, setIsPublishing] = useState(false);

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

  useEffect(() => {
    const categoryBySlug: Record<string, NewsCategory> = {
      ai: "AI",
      crypto: "Crypto",
      policy: "Policy",
      technology: "Technology",
      "fox-news": "Fox News",
      leadership: "Leadership",
    };

    const requestedSlug = new URLSearchParams(window.location.search).get("category");
    const initialCategory = requestedSlug ? categoryBySlug[requestedSlug.toLowerCase()] : undefined;
    if (initialCategory) setActiveTab(initialCategory);

    const handleCategorySelect = (event: Event) => {
      const selectedCategory = (event as CustomEvent<NewsCategory>).detail;
      if (NEWS_CATEGORIES.includes(selectedCategory)) setActiveTab(selectedCategory);
    };

    window.addEventListener("neurowire:category-select", handleCategorySelect);
    return () => window.removeEventListener("neurowire:category-select", handleCategorySelect);
  }, []);

  useEffect(() => {
    let active = true;

    async function loadMarketSnapshot() {
      try {
        const response = await fetch("/api/market", { cache: "no-store" });
        if (!response.ok) throw new Error("Market feed unavailable");

        const payload = await response.json();
        if (!Array.isArray(payload.quotes) || payload.quotes.length === 0) {
          throw new Error("No market quotes returned");
        }

        if (active) {
          setMarketQuotes(payload.quotes);
          setMarketUpdatedAt(typeof payload.fetchedAt === "string" ? payload.fetchedAt : null);
          setMarketStatus("live");
        }
      } catch {
        if (active) {
          // Keep last successful quotes visible, but never show them as current after a failed refresh.
          setMarketStatus("unavailable");
        }
      }
    }

    loadMarketSnapshot();
    const intervalId = window.setInterval(loadMarketSnapshot, 60_000);

    return () => {
      active = false;
      window.clearInterval(intervalId);
    };
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
  const [newCategory, setNewCategory] = useState<NewsCategory>("AI");
  const [newSource, setNewSource] = useState("");
  const [newImage, setNewImage] = useState("");
  const [newSummary, setNewSummary] = useState("");
  const [newArticle, setNewArticle] = useState("");

   // Bloomberg / Reuters Style Market Terminal Timestamp Calculator
  const formatTimeAgo = (dateStr?: string) => {
    if (!dateStr) return "Date unavailable";
    try {
      const targetDate = new Date(dateStr);
      if (isNaN(targetDate.getTime())) return "Recently";

      const now = new Date();
      
      const timeString = targetDate.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });

      const dateString = targetDate.toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });

      const isToday = targetDate.toDateString() === now.toDateString();

      const yesterday = new Date();
      yesterday.setDate(now.getDate() - 1);
      const isYesterday = targetDate.toDateString() === yesterday.toDateString();

      if (isToday) {
        return `Today, ${timeString} — ${dateString}`;
      } else if (isYesterday) {
        return `Yesterday, ${timeString} — ${dateString}`;
      } else {
        return `${dateString} at ${timeString}`;
      }
    } catch {
      return "Recently";
    }
  };

  // Verify admin access from the signed server-side session.
  useEffect(() => {
    let active = true;
    fetch("/api/admin/session", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error("Admin session unavailable");
        return response.json();
      })
      .then((payload) => {
        if (active) setIsAdmin(payload.isAuthenticated === true);
      })
      .catch(() => {
        if (active) setIsAdmin(false);
      })
      .finally(() => {
        if (active) setAdminStatusLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  // Load publisher stories from the existing public news feed.
  useEffect(() => {
    async function loadVaultNews() {
    try {
      const { data, error } = await supabase
        .from("news")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("News feed fetch error:", error.message);
        setNews([]);
        return;
      }

      if (data && data.length > 0) {
        const dbNews: NewsItem[] = data.map((item: any) => ({
          id: item.id.toString(),
          title: item.title,
          category: item.category || "AI",
          source: item.source || "Source not provided",
          readTime: `${Math.max(1, Math.ceil((item.content || item.description || "").trim().split(/\s+/).length / 200))} min read`,
          publishedAt: item.created_at || "",
          image: item.image_url || "",
          summary: item.description || item.title,
          fullReport: item.content ? item.content.split("\n\n") : [item.description || item.title],
          bullets: ["Publisher feed material; not independently verified by NeuroWire."],
        }));

        setNews(dbNews);
        return;
      }

      setNews([]);
    } catch (e: any) {
      console.error("News feed fetch failed:", e?.message || e);
      setNews([]);
    } finally {
      setNewsLoading(false);
    }
    }

    loadVaultNews();
  }, []);

  // Publish through a server route that validates the signed admin session.
  const handlePublishWire = async (e: React.FormEvent) => {
    e.preventDefault();
    setPublishingError("");

    const payload = {
      title: newTitle.trim(),
      category: newCategory,
      source: newSource.trim(),
      description: newSummary.trim() || newArticle.trim().slice(0, 240),
      content: newArticle.trim(),
      image_url: newImage.trim(),
    };

    if (!payload.title || !payload.source || payload.content.length < 40) {
      setPublishingError("Headline, source name, and a full article are required.");
      return;
    }

    setIsPublishing(true);
    try {
      const response = await fetch("/api/admin/news", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json().catch(() => null);
      if (!response.ok || !result?.success || !result.story) {
        throw new Error(result?.error || "The article could not be published.");
      }

      const saved = result.story;
      const savedContent = typeof saved.content === "string" ? saved.content : payload.content;
      const userStory: NewsItem = {
        id: String(saved.id),
        title: saved.title,
        category: saved.category,
        source: saved.source,
        readTime: `${Math.max(1, Math.ceil(savedContent.trim().split(/\\s+/).length / 200))} min read`,
        publishedAt: saved.created_at || new Date().toISOString(),
        image: saved.image_url || "",
        summary: saved.description || saved.title,
        fullReport: savedContent.split("\n\n").filter((paragraph: string) => paragraph.trim().length > 0),
        bullets: [],
      };

      setNews((current) => [userStory, ...current]);
      setNewTitle("");
      setNewSource("");
      setNewImage("");
      setNewSummary("");
      setNewArticle("");
      setPublishingError("");
      setShowPublishModal(false);
    } catch (error) {
      setPublishingError(error instanceof Error ? error.message : "The article could not be published.");
    } finally {
      setIsPublishing(false);
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminLoginError("");
    try {
      const response = await fetch("/api/admin/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: adminPassword }),
      });
      const result = await response.json().catch(() => null);
      if (!response.ok || result?.isAuthenticated !== true) {
        throw new Error(result?.error || "Admin sign-in failed.");
      }
      setIsAdmin(true);
      setAdminPassword("");
      setShowAdminLogin(false);
    } catch (error) {
      setAdminLoginError(error instanceof Error ? error.message : "Admin sign-in failed.");
    }
  };

  const handleAdminLogout = async () => {
    try {
      const response = await fetch("/api/admin/session", { method: "DELETE" });
      if (!response.ok) throw new Error("Sign out failed.");
      setIsAdmin(false);
      setShowPublishModal(false);
      setAdminPassword("");
      setAdminLoginError("");
    } catch {
      setAdminLoginError("Could not sign out. Please try again.");
    }
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

  const hero = filtered[0] || news[0] || null;

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 font-sans antialiased selection:bg-cyan-500 selection:text-black">
      {/* 1. TICKER */}
      <div className="bg-slate-950 border-b border-slate-800/80 py-2 sticky top-0 z-40 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between text-xs">
          <div className="flex flex-col shrink-0 pr-4 border-r border-slate-800">
            <div className="flex items-center gap-2 text-slate-300 font-semibold uppercase">
              <span className={`h-2 w-2 rounded-full ${marketStatus === "live" ? "bg-emerald-400" : marketStatus === "unavailable" ? "bg-amber-400" : "bg-slate-500"}`}></span>
              Market snapshot
            </div>
            <span className="text-[9px] text-slate-500 normal-case mt-0.5">
              {marketStatus === "loading"
                ? "Loading quotes..."
                : marketStatus === "unavailable"
                  ? marketUpdatedAt
                    ? `Refresh failed • last fetched ${new Date(marketUpdatedAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}`
                    : "Feed temporarily unavailable"
                  : marketUpdatedAt
                    ? `Fetched ${new Date(marketUpdatedAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}`
                    : "Waiting for quotes"}
            </span>
            <span className="text-[9px] text-slate-600 normal-case">Binance • USDT pairs</span>
          </div>
          <div className="flex items-center gap-6 overflow-x-auto whitespace-nowrap pl-4 no-scrollbar">
            {MARKET_SYMBOLS.map((symbol) => {
              const quote = marketQuotes.find((item) => item.symbol === symbol);
              const label = symbol.replace("USDT", "/USDT");
              return (
                <div key={symbol} className="flex items-center gap-2">
                  <span className="text-slate-400">{label}</span>
                  {quote ? (
                    <>
                      <span className="font-semibold text-slate-100 tabular-nums">{formatMarketPrice(quote.price)}</span>
                      <span className={`font-mono text-[11px] tabular-nums ${quote.changePercent >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                        {quote.changePercent > 0 ? "+" : ""}{quote.changePercent.toFixed(2)}%
                      </span>
                    </>
                  ) : (
                    <span className="text-slate-500 font-mono text-[11px]">
                      {marketStatus === "loading" ? "Loading..." : "Unavailable"}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. NAVBAR (WITH SECRET ADMIN UNLOCK) */}
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="text-2xl font-black text-white">
                Neuro<span className="text-cyan-400">Wire</span>
              </span>
              <p className="text-[10px] uppercase text-slate-400 font-mono">Market & Frontier Tech Intelligence</p>
            </div>
          </div>

          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search reports, policy, or tickers..."
              className="w-full bg-slate-950 border border-slate-800 rounded-full pl-9 pr-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
            />
          </div>
<nav aria-label="Main navigation" className="hidden lg:flex items-center gap-6 text-sm font-medium">
  <a href="#latest-news" className="text-slate-300 hover:text-cyan-400 transition-colors">Latest</a>
  <a href="#categories" className="text-slate-300 hover:text-cyan-400 transition-colors">Categories</a>
  <a href="/about" className="text-slate-400 hover:text-slate-200 transition-colors">About</a>
</nav>
          {/* TAREEQA 2: SIRF ADMIN KO DIKHEGA */}
          {isAdmin && (
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowPublishModal(true)}
                className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-indigo-600 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-lg shadow-cyan-500/20 hover:opacity-90 transition-all"
              >
                <Plus className="h-4 w-4" /> Publish Wire (Admin)
              </button>
            </div>
          )}
        </div>
      </header>

      {/* 3. HERO DISPATCH */}
      <section className="max-w-7xl mx-auto px-4 pt-8 pb-8">
        {hero ? (
        <div className="relative rounded-3xl border border-slate-800 bg-slate-900/80 overflow-hidden shadow-2xl">
          <div className="relative h-72 md:h-96 w-full overflow-hidden">
            {hero.image ? (
                <img src={hero.image} alt={hero.title} className="w-full h-full object-cover opacity-45" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-sm text-slate-500">Publisher image not available</div>
              )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#070b14] via-[#070b14]/70 to-transparent" />
          </div>

          <div className="p-6 md:p-8 -mt-28 relative z-10 space-y-4">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-semibold uppercase">
                Latest story
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800 font-mono">
                Source: {hero.source}
              </span>
              <span className="text-slate-400 font-mono">{hero.readTime} • {formatTimeAgo(hero.publishedAt)}</span>
            </div>

            <h1 className="text-2xl md:text-4xl font-extrabold text-white leading-tight max-w-4xl">
              {hero.title}
            </h1>

            <p className="text-sm text-slate-300 leading-relaxed max-w-3xl">
              {hero.summary}
            </p>

            <button
              onClick={() => router.push(`/news/${encodeURIComponent(hero.title)}`)}
              
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all"
            >
              <BookOpen className="h-4 w-4" /> Read Publisher Summary
            </button>
          </div>
        </div>
        ) : (
          <div className="rounded-3xl border border-slate-800 bg-slate-900/60 px-6 py-12 text-center text-slate-300">
            <h1 className="text-xl font-semibold text-white">
              {newsLoading ? "Loading latest news..." : "No publisher articles are available right now."}
            </h1>
            <p className="mt-2 text-sm text-slate-400">
              New stories will appear here when the publisher feeds provide them.
            </p>
          </div>
        )}
      </section>

      {/* 4. MACRO WIRE FEED */}
      <section id="categories" className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Cpu className="h-6 w-6 text-cyan-400" /> Frontier Wire Feed
          </h2>

          <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-full border border-slate-800">
            {["All", ...NEWS_CATEGORIES].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold ${
                  activeTab === tab ? "bg-cyan-500 text-black font-bold" : "text-slate-400"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

{filtered.length === 0 ? (
  <div className="p-12 rounded-2xl border border-slate-800 bg-slate-900/40 text-center text-slate-400">
    {newsLoading
      ? "Loading latest news..."
      : news.length === 0
        ? "Abhi publisher feeds se koi news available nahi."
        : "Koi article nahi mila. Search ya category change karke dekhein."}
  </div>
) : (

  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
    {filtered.slice(0, visibleCount).map((item) => (
      <div
        key={item.id}
        className="bg-slate-900/50 border border-slate-800 rounded-3xl p-5 flex flex-col justify-between group hover:border-slate-700 transition-all shadow-xl"
      >
              <div>
                <div className="relative h-48 w-full rounded-2xl overflow-hidden mb-4 bg-slate-950">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-slate-500">
                      Publisher image not available
                    </div>
                  )}
                  <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-slate-950/80 backdrop-blur-md text-cyan-400 border border-cyan-500/30">
                    {item.category}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-2 text-xs text-slate-500 font-mono mb-2">
                  <span> {formatTimeAgo(item.publishedAt)}</span>
                  
                </div>

                <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors mb-2 leading-snug">
                  {item.title}
                </h3>

                <p className="text-xs text-slate-400 line-clamp-3 mb-4 leading-relaxed">
                  {item.summary}
                </p>
              </div>

              <div className="border-t border-slate-800 pt-3 flex items-center justify-between">
                <button
                  onClick={() => router.push(`/news/${encodeURIComponent(item.title)}`)}
                  
                  className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl bg-cyan-950 text-cyan-300 border border-cyan-800/40 hover:bg-cyan-900/60 font-semibold"
                >
                  <BookOpen className="h-3.5 w-3.5" /> Read Publisher Summary
                </button>

                <button
                  onClick={() => toggleVoiceReader(item)}
                  className={`p-2 rounded-xl border ${
                    isReading ? "bg-cyan-500 text-black border-cyan-400" : "bg-slate-800 text-slate-300 border-slate-700 hover:text-cyan-400"
                  }`}
                  title="Audio Reader"
                >
                  {isReading ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </button>
              </div>
            </div>
    
    ))}
  </div>
)}
        {/* BLOOMBERG STYLE LOAD MORE BUTTON */}
        {visibleCount < filtered.length && (
          <div className="flex justify-center mt-10">
            <button
              onClick={() => setVisibleCount((prev) => prev + 6)}
              className="flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-cyan-500/40 text-cyan-400 hover:text-white font-bold text-xs uppercase tracking-wider transition-all shadow-xl shadow-cyan-500/10 active:scale-95"
            >
              <Zap className="h-4 w-4" /> Load More Intelligence Wire ({filtered.length - visibleCount} Remaining)
            </button>
          </div>
        )}
      </section>

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
                    {NEWS_CATEGORIES.map((category) => (
                      <option key={category} value={category}>{category}</option>
                    ))}
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
