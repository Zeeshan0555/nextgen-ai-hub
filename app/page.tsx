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
  category: NewsCategory | "Uncategorized";
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

type TopicRule = { label: string; keywords: string[] };

const CATEGORY_TOPICS: Record<NewsCategory, TopicRule[]> = {
  AI: [
    { label: "AI Models & Tools", keywords: ["foundation model", "language model", "chatgpt", "claude", "gemini", "copilot", "llm", "AI tool", "AI tools"] },
    { label: "AI Research", keywords: ["AI research", "machine learning research", "research paper", "AI study", "benchmark", "breakthrough"] },
    { label: "Generative AI", keywords: ["generative", "image generation", "video generation", "text-to-image", " sora "] },
    { label: "AI Agents & Automation", keywords: ["agent", "automation", "workflow", "autonomous"] },
    { label: "Robotics", keywords: ["robot", "humanoid", "robotics"] },
    { label: "AI Business", keywords: ["AI enterprise", "AI startup", "AI company", "AI investment", "AI funding", "AI revenue"] },
  ],
  Crypto: [
    { label: "Bitcoin", keywords: ["bitcoin", "btc"] },
    { label: "Ethereum & Altcoins", keywords: ["ethereum", "ether", "eth", "solana", "sol ", "altcoin"] },
    { label: "Blockchain & Web3", keywords: ["blockchain", "web3", "web 3"] },
    { label: "DeFi", keywords: ["defi", "decentralized finance", "liquidity pool"] },
    { label: "Crypto Regulations", keywords: ["crypto regulation", "crypto law", "sec ", "regulator", "legislation"] },
  ],
  Policy: [
    { label: "AI Regulations", keywords: ["artificial intelligence act", "ai regulation", "ai safety law", "ai policy"] },
    { label: "Technology Laws", keywords: ["technology law", "digital law", "online safety act", "antitrust"] },
    { label: "Government Decisions", keywords: ["government", "minister", "parliament", "white house", "cabinet"] },
    { label: "Data Privacy", keywords: ["privacy", "data protection", "personal data", "gdpr"] },
    { label: "Cybersecurity Policy", keywords: ["cybersecurity policy", "cyber security law", "security directive"] },
  ],
  Technology: [
    { label: "Smartphones & Devices", keywords: ["iphone", "smartphone", "android", "mobile device", "laptop", "semiconductor", "processor chip"] },
    { label: "Software", keywords: ["software", "mobile app", "operating system", "windows", "browser"] },
    { label: "Cybersecurity", keywords: ["cybersecurity", "cyber attack", "hacking", "malware", "data breach"] },
    { label: "Space & Science", keywords: ["space", " nasa ", "satellite", "scientist", "science", "mission"] },
    { label: "Robotics", keywords: ["robot", "robotics", "humanoid"] },
    { label: "Big Tech Companies", keywords: ["apple", "google", "microsoft", "meta", "amazon", "nvidia"] },
  ],
  "Fox News": [
    { label: "US Politics", keywords: ["trump", "congress", "senate", "election", "white house", "republican", "democrat"] },
    { label: "World News", keywords: ["international relations", "ukraine", "china", "middle east", "foreign policy"] },
    { label: "Business & Economy", keywords: ["business", "economy", "market", "inflation", "jobs", "company"] },
    { label: "Technology Coverage", keywords: ["technology", "artificial intelligence", "cyber", "tech"] },
  ],
  Leadership: [
    { label: "Tech CEOs", keywords: ["ceo", "chief executive", "founder"] },
    { label: "AI Industry Leaders", keywords: ["openai", "anthropic", "deepmind", "ai leader"] },
    { label: "Business Strategies", keywords: ["business strategy", "business plan", "leadership strategy", "corporate strategy"] },
    { label: "Company Leadership", keywords: ["executive", "board", "management", "appointed"] },
    { label: "Interviews & Innovation", keywords: ["CEO interview", "leadership interview", "innovation strategy", "executive vision"] },
  ],
};

function getNewsSubcategory(item: NewsItem): string {
  const rules = CATEGORY_TOPICS[item.category as NewsCategory];
  if (!rules) return "Other";

  const title = item.title.toLocaleLowerCase();
  const summary = item.summary.toLocaleLowerCase();
  const matchesKeyword = (text: string, keyword: string) => {
    const normalized = keyword.trim().toLocaleLowerCase();
    if (!normalized) return false;
    if (normalized.includes(" ")) return text.includes(normalized);
    return text.split(/[^a-z0-9]+/).includes(normalized);
  };

  // Headline matches carry more weight than a passing mention in the summary.
  const ranked = rules.map((rule) => ({
    label: rule.label,
    score: rule.keywords.reduce((score, keyword) =>
      score + (matchesKeyword(title, keyword) ? 3 : 0) +
        (matchesKeyword(summary, keyword) ? 1 : 0), 0),
  })).sort((left, right) => right.score - left.score);

  return ranked[0]?.score >= 2 ? ranked[0].label : "Other";
}

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
  const [activeSubcategory, setActiveSubcategory] = useState<string>("All topics");
  const [search, setSearch] = useState<string>("");
  const [activeStory, setActiveStory] = useState<NewsItem | null>(null);
  const [isReading, setIsReading] = useState(false);
  const [visibleCount, setVisibleCount] = useState(6);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminStatusLoading, setAdminStatusLoading] = useState(true);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [showAuthorNotice, setShowAuthorNotice] = useState(false);
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
    const requestedTopic = new URLSearchParams(window.location.search).get("topic");
    if (requestedTopic && initialCategory) {
      const validTopics = [...CATEGORY_TOPICS[initialCategory].map((topic) => topic.label), "Other"];
      if (validTopics.includes(requestedTopic)) setActiveSubcategory(requestedTopic);
    }

    const handleCategorySelect = (event: Event) => {
      const selectedCategory = (event as CustomEvent<NewsCategory>).detail;
      if (NEWS_CATEGORIES.includes(selectedCategory)) {
        setActiveTab(selectedCategory);
        setActiveSubcategory("All topics");
      }
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

  // Load stored newsroom articles first, then merge in the live publisher feed.
  // This keeps the homepage populated when the database is empty or temporarily unavailable.
  useEffect(() => {
    let active = true;

    async function loadVaultNews() {
      const storedStories: NewsItem[] = [];

      try {
        const { data, error } = await supabase
          .from("news")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) {
          console.error("News feed fetch error:", error.message);
        } else if (Array.isArray(data)) {
          storedStories.push(...data.map((item: any): NewsItem => ({
            id: String(item.id),
            title: String(item.title || "Untitled story"),
            category: NEWS_CATEGORIES.includes(item.category as NewsCategory)
              ? (item.category as NewsCategory)
              : "Uncategorized",
            source: String(item.source || "Source not provided"),
            readTime: `${Math.max(1, Math.ceil(String(item.content || item.description || "").trim().split(/\s+/).filter(Boolean).length / 200))} min read`,
            publishedAt: String(item.created_at || ""),
            image: String(item.image_url || ""),
            summary: String(item.description || item.title || ""),
            fullReport: typeof item.content === "string" && item.content.trim()
              ? item.content.split("\n\n")
              : [String(item.description || item.title || "")],
            bullets: ["Publisher material; NeuroWire has not independently verified every claim."],
          })));
        }
      } catch (error) {
        console.error("Stored news could not be loaded:", error);
      }

      try {
        const response = await fetch("/api/news", { cache: "no-store" });
        if (!response.ok) throw new Error("Live publisher feeds are unavailable.");
        const payload = await response.json();

        if (payload?.success === true && Array.isArray(payload.news)) {
          const liveStories: NewsItem[] = payload.news
            .filter((item: any) =>
              typeof item?.title === "string" &&
              item.title.trim().length > 0 &&
              NEWS_CATEGORIES.includes(item.category as NewsCategory) &&
              typeof item.source === "string" &&
              typeof item.created_at === "string" &&
              Number.isFinite(Date.parse(item.created_at))
            )
            .map((item: any) => {
              const articleText = typeof item.content === "string" ? item.content : "";
              const summary = typeof item.description === "string" && item.description.trim()
                ? item.description
                : "Open the publisher's original report for the full story.";
              return {
                // The article route accepts a title when a story is not stored in the database.
                id: item.title,
                title: item.title,
                category: item.category as NewsCategory,
                source: item.source,
                readTime: `${Math.max(1, Math.ceil((articleText || summary).trim().split(/\s+/).filter(Boolean).length / 200))} min read`,
                publishedAt: item.created_at,
                image: typeof item.image_url === "string" ? item.image_url : "",
                summary,
                fullReport: articleText ? articleText.split("\n\n") : [summary],
                bullets: ["Live publisher feed material. Open the original source for full context."],
              };
            });

          const seenTitles = new Set(storedStories.map((story) => story.title.trim().toLocaleLowerCase()));
          for (const story of liveStories) {
            const key = story.title.trim().toLocaleLowerCase();
            if (!seenTitles.has(key)) {
              storedStories.push(story);
              seenTitles.add(key);
            }
          }
        }
      } catch (error) {
        console.warn("Live publisher feed could not be merged:", error);
      }

      if (active) {
        const sorted = storedStories.sort((left, right) => {
          const leftTime = Date.parse(left.publishedAt);
          const rightTime = Date.parse(right.publishedAt);
          return (Number.isFinite(rightTime) ? rightTime : 0) -
            (Number.isFinite(leftTime) ? leftTime : 0);
        });
        setNews(sorted);
        setNewsLoading(false);
      }
    }

    loadVaultNews();
    return () => {
      active = false;
    };
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
        readTime: `${Math.max(1, Math.ceil(savedContent.trim().split(/\s+/).length / 200))} min read`,
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

  const searchTerm = search.trim().toLowerCase();

  // Keep the homepage feed in publication order, with undated records last.
  const sortedNews = [...news].sort((left, right) => {
    const leftTime = Date.parse(left.publishedAt);
    const rightTime = Date.parse(right.publishedAt);
    const safeLeftTime = Number.isFinite(leftTime) ? leftTime : 0;
    const safeRightTime = Number.isFinite(rightTime) ? rightTime : 0;
    return safeRightTime - safeLeftTime;
  });

  const filtered = sortedNews.filter((item) => {
    const matchesTab = activeTab === "All" || item.category === activeTab;
    const matchesSubcategory = activeSubcategory === "All topics" || getNewsSubcategory(item) === activeSubcategory;
    const searchableFields = [item.title, item.summary, item.source, item.category];
    const matchesSearch = searchableFields.some((field) =>
      field.toLowerCase().includes(searchTerm)
    );
    return matchesTab && matchesSubcategory && matchesSearch;
  });

  // Never show an unrelated story when a selected category has no results.
  const hero = filtered[0] || null;

  const handleCategoryChange = (category: string) => {
    setActiveTab(category);
    setVisibleCount(6);
    const nextUrl = new URL(window.location.href);
    if (category === "All") nextUrl.searchParams.delete("category");
    else nextUrl.searchParams.set("category", category.toLowerCase().split(" ").join("-"));
    window.history.replaceState(null, "", nextUrl.toString());
  };

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
          {isAdmin && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowPublishModal(true)}
                className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-indigo-600 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-lg shadow-cyan-500/20 hover:opacity-90 transition-all"
              >
                <Plus className="h-4 w-4" /> Publish Wire
              </button>
              <button
                onClick={handleAdminLogout}
                className="px-3 py-2 rounded-xl border border-slate-700 text-slate-300 hover:text-white text-xs"
              >
                Sign out
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
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Cpu className="h-6 w-6 text-cyan-400" /> {activeTab === "All" ? "Latest News" : activeTab === "Fox News" ? "Fox News" : activeTab + " News"}
            </h2>
            <p className="mt-1 text-xs text-slate-400">
              {activeTab === "All" ? "The latest stories across all six categories." : "Showing stories from this category only."}
            </p>
          </div>

          <div className="flex max-w-full items-center gap-2 overflow-x-auto bg-slate-950 p-1.5 rounded-full border border-slate-800">
            {["All", ...NEWS_CATEGORIES].map((tab) => (
              <button
                key={tab}
                onClick={() => handleCategoryChange(tab)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold ${
                  activeTab === tab ? "bg-cyan-500 text-black font-bold" : "text-slate-400"
                }`}
              >
                {tab === "All" ? "Latest" : tab}
              </button>
            ))}
          </div>
        </div>

        {activeTab !== "All" && (
          <div className="mb-6">
            <p className="text-[11px] uppercase tracking-wider text-slate-500 mb-2">Filter by topic</p>
            <div className="flex max-w-full items-center gap-2 overflow-x-auto pb-2">
              {["All topics", ...(CATEGORY_TOPICS[activeTab as NewsCategory] || []).map((topic) => topic.label), "Other"].map((topic) => (
                <button
                  key={topic}
                  type="button"
                  onClick={() => {
                    setActiveSubcategory(topic);
                    setVisibleCount(6);
                    const nextUrl = new URL(window.location.href);
                    if (topic === "All topics") nextUrl.searchParams.delete("topic");
                    else nextUrl.searchParams.set("topic", topic);
                    window.history.replaceState(null, "", nextUrl.toString());
                  }}
                  className={`shrink-0 px-3 py-1.5 rounded-full border text-xs font-medium ${activeSubcategory === topic ? "bg-indigo-500/20 border-indigo-400 text-indigo-200" : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"}`}
                >
                  {topic}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Topics are suggested from headline and summary keywords; check the article itself for its full context.</p>
          </div>
        )}

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

      <footer id="site-footer" className="mt-20 border-t border-slate-800 py-10 px-4 text-slate-400 text-sm flex flex-col items-center gap-5">
        <nav aria-label="Site information" className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
          <a href="/about" className="hover:text-cyan-400 transition-colors">About</a>
          <a href="/editorial-policy" className="hover:text-cyan-400 transition-colors">Editorial Policy</a>
          <a href="/ai-disclosure" className="hover:text-cyan-400 transition-colors">AI & Automation</a>
          <a href="/privacy" className="hover:text-cyan-400 transition-colors">Privacy Policy</a>
        </nav>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2 border-t border-slate-800/80 w-full max-w-xl">
          {!isAdmin && (
            <button
              type="button"
              onClick={() => {
                setAdminLoginError("");
                setShowAdminLogin(true);
              }}
              disabled={adminStatusLoading}
              className="px-4 py-2 rounded-xl border border-slate-700 bg-slate-900/70 text-slate-300 hover:text-white hover:border-cyan-500/50 disabled:opacity-50 text-xs font-semibold transition-colors"
            >
              {adminStatusLoading ? "Checking admin access..." : "Admin sign in"}
            </button>
          )}
          <button
            type="button"
            onClick={() => setShowAuthorNotice(true)}
            className="px-4 py-2 rounded-xl border border-slate-700 bg-slate-900/70 text-slate-300 hover:text-white hover:border-purple-500/50 text-xs font-semibold transition-colors"
          >
            Author sign in
          </button>
        </div>

        <p className="text-center text-xs text-slate-600">
          © 2026 NeuroWire. All rights reserved.
        </p>
      </footer>
      
        {/* Secure admin sign-in */}
      {showAuthorNotice && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-sm w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">Author access</h3>
              <button
                type="button"
                onClick={() => setShowAuthorNotice(false)}
                className="p-2 text-slate-400 hover:text-white rounded-full bg-slate-800"
                aria-label="Close author access notice"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">
              Author sign-in is not available yet. The author application, approval and secure login system still needs to be built.
            </p>
            <button
              type="button"
              onClick={() => setShowAuthorNotice(false)}
              className="mt-5 w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {showAdminLogin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-sm w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">Admin sign in</h3>
              <button
                type="button"
                onClick={() => {
                  setShowAdminLogin(false);
                  setAdminPassword("");
                  setAdminLoginError("");
                }}
                className="p-2 text-slate-400 hover:text-white rounded-full bg-slate-800"
                aria-label="Close admin sign-in"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleAdminLogin} className="space-y-3">
              <label className="block text-xs text-slate-400">
                Admin password
                <input
                  type="password"
                  required
                  autoComplete="current-password"
                  value={adminPassword}
                  onChange={(event) => setAdminPassword(event.target.value)}
                  className="mt-1 w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </label>
              {adminLoginError && (
                <p role="alert" className="text-xs text-rose-400">{adminLoginError}</p>
              )}
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs"
              >
                Sign in securely
              </button>
            </form>
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
                    {NEWS_CATEGORIES.map((category) => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Publisher / Source Name *</label>
                  <input type="text" required maxLength={120} value={newSource} onChange={(e) => setNewSource(e.target.value)} placeholder="Enter the real publisher or source" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500" />
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
              {publishingError && <p role="alert" className="text-xs text-rose-400">{publishingError}</p>}
              <button type="submit" disabled={isPublishing} className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-black font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all mt-2">
                Publish to NeuroWire
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
