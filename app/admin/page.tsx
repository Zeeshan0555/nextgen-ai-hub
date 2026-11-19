'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { 
  LayoutDashboard, 
  FileText, 
  Cpu, 
  Database, 
  ShieldCheck, 
  Settings, 
  Menu, 
  X, 
  Zap,
  Search,
  Pencil,
  ExternalLink,
} from 'lucide-react';

interface Article {
  id: string;
  title: string;
  category: string;
  source?: string | null;
  description?: string | null;
  content?: string | null;
  image_url?: string | null;
  created_at?: string | null;
}

type ArticleEditForm = {
  title: string;
  category: string;
  source: string;
  description: string;
  content: string;
  image_url: string;
  source_url: string;
};

type AdminAuthorDraft = {
  id: string;
  title: string;
  category: string;
  source: string;
  sourceUrl: string;
  description: string;
  content: string;
  imageUrl: string;
  status: "draft" | "submitted" | "revision_requested" | "published";
  feedback: string;
  author: string;
  createdAt: string;
  updatedAt: string;
};

const ADMIN_CATEGORIES = ["AI", "Crypto", "Policy", "Technology", "Fox News", "Leadership"] as const;

function getOriginalSourceUrl(content: string): string {
  const line = content.split("\n").find((part) => part.startsWith("ORIGINAL_SOURCE_URL:"));
  return line ? line.slice("ORIGINAL_SOURCE_URL:".length).trim() : "";
}

export default function AdminDashboard() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState("");
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [articleError, setArticleError] = useState(false);
  const [articleSearch, setArticleSearch] = useState("");
  const [articleCategory, setArticleCategory] = useState("All");
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [editForm, setEditForm] = useState<ArticleEditForm>({ title: "", category: "AI", source: "", description: "", content: "", image_url: "", source_url: "" });
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState("");
  const [authorDrafts, setAuthorDrafts] = useState<AdminAuthorDraft[]>([]);
  const [authorDraftsLoading, setAuthorDraftsLoading] = useState(true);
  const [authorDraftsError, setAuthorDraftsError] = useState("");
  const [draftFeedback, setDraftFeedback] = useState<Record<string, string>>({});
  const [reviewingDraftId, setReviewingDraftId] = useState("");
  useEffect(() => {
    let active = true;
    async function fetchAuthorDrafts() {
      try {
        const response = await fetch("/api/admin/author-drafts", { cache: "no-store" });
        const payload = await response.json();
        if (!response.ok || !payload.success || !Array.isArray(payload.drafts)) {
          throw new Error(typeof payload.error === "string" ? payload.error : "Author submissions are not available.");
        }
        if (active) {
          setAuthorDrafts(payload.drafts as AdminAuthorDraft[]);
          setAuthorDraftsError("");
        }
      } catch (error) {
        if (active) setAuthorDraftsError(error instanceof Error ? error.message : "Author submissions could not be loaded.");
      } finally {
        if (active) setAuthorDraftsLoading(false);
      }
    }
    fetchAuthorDrafts();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    async function fetchArticles() {
      try {
        const { data, error } = await supabase
          .from('news')
          .select('id, title, category, source, description, content, image_url, created_at')
          .neq('source', 'NeuroWire Private Draft')
          .order('created_at', { ascending: false })
          .limit(50);

        if (error) {
          setArticleError(true);
          console.error('Error fetching articles:', error);
        } else if (data) {
          setArticleError(false);
          setArticles(data);
        }
      } catch (err) {
        setArticleError(true);
        console.error('Unexpected error:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchArticles();
  }, []);

  const filteredArticles = articles.filter((article) => {
    const query = articleSearch.trim().toLocaleLowerCase();
    const searchableText = [article.title, article.source || "", article.description || ""].join(" ").toLocaleLowerCase();
    const matchesQuery = searchableText.includes(query);
    const matchesCategory = articleCategory === "All" || article.category === articleCategory;
    return matchesQuery && matchesCategory;
  });

  const openArticleEditor = (article: Article) => {
    setEditingArticle(article);
    setEditError("");
    setEditForm({
      title: article.title || "",
      category: ADMIN_CATEGORIES.includes(article.category as (typeof ADMIN_CATEGORIES)[number]) ? article.category : "AI",
      source: article.source || "",
      description: article.description || "",
      content: article.content || "",
      image_url: article.image_url || "",
      source_url: getOriginalSourceUrl(article.content || ""),
    });
  };

  const saveArticleChanges = async () => {
    if (!editingArticle) return;
    setEditSaving(true);
    setEditError("");
    try {
      const response = await fetch("/api/admin/news", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingArticle.id, ...editForm }),
      });
      const payload = await response.json();
      if (!response.ok || !payload.success || !payload.story) {
        throw new Error(typeof payload.error === "string" ? payload.error : "The article could not be updated.");
      }
      setArticles((current) => current.map((article) =>
        article.id === editingArticle.id ? { ...article, ...payload.story } : article
      ));
      setEditingArticle(null);
    } catch (error) {
      setEditError(error instanceof Error ? error.message : "The article could not be updated. Please try again.");
    } finally {
      setEditSaving(false);
    }
  };

  const reviewAuthorDraft = async (draft: AdminAuthorDraft, action: "request_revision" | "publish") => {
    if (action === "publish" && !window.confirm("Publish this Author article to the public news feed?")) return;
    setReviewingDraftId(draft.id);
    setAuthorDraftsError("");
    try {
      const response = await fetch("/api/admin/author-drafts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: draft.id,
          action,
          feedback: draftFeedback[draft.id] || "",
        }),
      });
      const payload = await response.json();
      if (!response.ok || !payload.success || !payload.draft) {
        throw new Error(typeof payload.error === "string" ? payload.error : "The Author submission could not be updated.");
      }
      setAuthorDrafts((current) => current.map((item) => item.id === draft.id ? payload.draft : item));
      setDraftFeedback((current) => ({ ...current, [draft.id]: "" }));
    } catch (error) {
      setAuthorDraftsError(error instanceof Error ? error.message : "The review action could not be completed.");
    } finally {
      setReviewingDraftId("");
    }
  };

  return (
    <div className="min-h-screen bg-[#07080b] text-slate-100 flex font-sans selection:bg-purple-500 selection:text-white">
      
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#0c0e15] border-r border-purple-900/30 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} flex flex-col`}>
        <div className="p-6 flex items-center justify-between border-b border-slate-800/60">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-600/30">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold tracking-wider text-lg bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">NEUROWIRE</h1>
              <span className="text-[10px] text-slate-400 tracking-widest uppercase">AI Command Center</span>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-slate-400 hover:text-white">
            <X className="h-6 w-6" />
          </button>
        </div>

        <nav className="p-4 space-y-1.5 flex-1" aria-label="Admin sections">
          <a href="#overview" onClick={() => setSidebarOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-purple-600/10 text-purple-400 border border-purple-500/20 font-medium">
            <LayoutDashboard className="h-5 w-5" /> Dashboard
          </a>
          <a href="#recent-articles" onClick={() => setSidebarOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/40">
            <FileText className="h-5 w-5" /> News Articles
          </a>
          <a href="#system-health" onClick={() => setSidebarOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/40">
            <ShieldCheck className="h-5 w-5" /> System Health
          </a>
          <a href="#automation-status" onClick={() => setSidebarOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/40">
            <Cpu className="h-5 w-5" /> AI Automation
          </a>
          <a href="#vector-status" onClick={() => setSidebarOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/40">
            <Database className="h-5 w-5" /> Vector Search
          </a>
          <a href="#security-status" onClick={() => setSidebarOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/40">
            <ShieldCheck className="h-5 w-5" /> Security
          </a>
          <a href="#settings-status" onClick={() => setSidebarOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/40">
            <Settings className="h-5 w-5" /> Settings
          </a>
        </nav>

        <div className="p-4 border-t border-slate-800/60 bg-[#090a0f]">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gradient-to-r from-cyan-500 to-purple-600 flex items-center justify-center font-bold text-sm">Z</div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold truncate">Zeeshan0555</p>
              <p className="text-xs text-slate-400">Administrator</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <header className="sticky top-0 z-40 bg-[#07080b]/80 backdrop-blur-md border-b border-slate-800/60 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-slate-400 hover:text-white">
              <Menu className="h-6 w-6" />
            </button>
            <div>
              <h2 className="text-xl font-bold tracking-wide">Admin Dashboard</h2>
              <p className="text-xs text-slate-400">Recent article records and newsroom checks.</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {signOutError && <span role="alert" className="text-xs text-rose-400">{signOutError}</span>}
            <button
              type="button"
              disabled={signingOut}
              onClick={async () => {
                setSigningOut(true);
                setSignOutError("");
                try {
                  const response = await fetch("/api/admin/session", { method: "DELETE" });
                  if (!response.ok) throw new Error("Sign out failed");
                  router.replace("/");
                  router.refresh();
                } catch {
                  setSignOutError("Could not sign out. Please try again.");
                  setSigningOut(false);
                }
              }}
              className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white disabled:opacity-50 text-xs font-medium"
            >
              {signingOut ? "Signing out..." : "Sign out"}
            </button>
          </div>
        </header>

        <main id="overview" className="p-6 space-y-6 flex-1 scroll-mt-24">
          {/* Live overview based only on data this page can verify */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-[#0c0e15] border border-slate-800/80 rounded-2xl p-5 relative overflow-hidden">
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Recent Articles Loaded</p>
              <h3 className="text-3xl font-extrabold mt-2 tracking-tight">
                {loading ? "—" : articleError ? "Unavailable" : articles.length}
              </h3>
              <p className="text-xs text-slate-400 mt-2">Latest five records requested</p>
            </div>

            <div className="bg-[#0c0e15] border border-slate-800/80 rounded-2xl p-5 relative overflow-hidden">
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Categories in Recent Records</p>
              <h3 className="text-3xl font-extrabold mt-2 tracking-tight">
                {loading || articleError ? "—" : new Set(articles.map((article) => article.category).filter(Boolean)).size}
              </h3>
              <p className="text-xs text-slate-400 mt-2">Distinct categories in this sample</p>
            </div>

            <div className="bg-[#0c0e15] border border-slate-800/80 rounded-2xl p-5 relative overflow-hidden">
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Latest Publication</p>
              <h3 className="text-lg font-extrabold mt-2 tracking-tight">
                {loading ? "Loading" : articleError ? "Unavailable" : articles[0]?.created_at && !Number.isNaN(Date.parse(articles[0].created_at)) ? new Date(articles[0].created_at).toLocaleDateString() : "Not available"}
              </h3>
              <p className="text-xs text-slate-400 mt-2 line-clamp-2">
                {articles[0]?.title || "No recent article title available"}
              </p>
            </div>
          </div>

          <section id="system-health" className="bg-[#0c0e15] border border-slate-800/80 rounded-2xl p-6 space-y-4 scroll-mt-24">
            <div>
              <h3 className="font-bold text-lg">System Health & Monitoring</h3>
              <p className="text-xs text-slate-400 mt-1">Private admin view. These indicators report only checks this dashboard actually performs.</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-2">
              <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                <p className="text-xs text-slate-400">News database read</p>
                <p className={"mt-2 text-sm font-semibold " + (loading ? "text-slate-300" : articleError ? "text-rose-300" : "text-emerald-300")}>
                  {loading ? "Checking" : articleError ? "Unavailable" : "Read successful"}
                </p>
                <p className="text-[11px] text-slate-500 mt-1">Based on the latest articles query already used by this dashboard.</p>
              </div>
              <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
                <p className="text-xs text-slate-400">Automatic source setup</p>
                <p className="mt-2 text-sm font-semibold text-amber-300">Five source-driven sections + Fox link</p>
                <p className="text-[11px] text-slate-400 mt-1">Official feeds are configured for AI, Crypto, Policy, Technology and Leadership. Fox News remains a direct publisher link. Feed uptime and freshness are not measured here yet.</p>
              </div>
            </div>
            <p className="text-[11px] text-slate-500">No live source-health, cron-history, traffic, or security-event endpoint is connected yet. Those items are not shown as working or healthy until real data is available.</p>
          </section>

          {/* Recent article records */}
          <div id="recent-articles" className="bg-[#0c0e15] border border-slate-800/80 rounded-2xl p-6 scroll-mt-24">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-lg">Recent News Articles</h3>
                <p className="text-xs text-slate-400">Search and update the latest 50 records returned by the news table.</p>
              </div>
              <button 
                onClick={() => window.location.reload()}
                className="px-3 py-1.5 rounded-lg bg-purple-600/20 text-purple-400 text-xs font-semibold border border-purple-500/30 hover:bg-purple-600/30 transition-all"
              >
                Refresh Data
              </button>
            </div>

            <div className="mb-4 flex flex-col gap-3 sm:flex-row">
              <label className="relative flex-1">
                <span className="sr-only">Search articles</span>
                <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                <input value={articleSearch} onChange={(event) => setArticleSearch(event.target.value)} placeholder="Search title, source or summary" className="w-full rounded-xl border border-slate-700 bg-slate-950 py-2 pl-9 pr-3 text-sm text-slate-200 outline-none focus:border-purple-500" />
              </label>
              <label className="sm:w-52">
                <span className="sr-only">Filter by category</span>
                <select value={articleCategory} onChange={(event) => setArticleCategory(event.target.value)} className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-200 outline-none focus:border-purple-500">
                  <option value="All">All categories</option>
                  {ADMIN_CATEGORIES.map((category) => <option key={category} value={category}>{category}</option>)}
                </select>
              </label>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="border-b border-slate-800 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="py-3 px-4">Article Title</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-slate-500 text-xs">
                        Loading recent articles...
                      </td>
                    </tr>
                  ) : articles.length === 0 || filteredArticles.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-slate-500 text-xs">
                        {articles.length === 0 ? "No recent articles were returned." : "No articles match these filters."}
                      </td>
                    </tr>
                  ) : (
                    filteredArticles.map((art) => (
                      <tr key={art.id} className="hover:bg-slate-900/40 transition-colors">
                        <td className="py-3 px-4 font-medium text-white">{art.title}</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-1 rounded-md bg-purple-500/10 text-purple-400 text-xs">
                            {art.category || 'General'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="flex items-center gap-1.5 text-slate-400 text-xs">
                            <span className="h-1.5 w-1.5 rounded-full bg-slate-500"></span>
                            {art.created_at && !Number.isNaN(Date.parse(art.created_at)) ? "Saved record" : "Date unavailable"}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-xs text-slate-400">
                          {art.created_at && !Number.isNaN(Date.parse(art.created_at))
                            ? new Date(art.created_at).toLocaleDateString()
                            : "Date unavailable"}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <button type="button" onClick={() => openArticleEditor(art)} className="inline-flex items-center gap-1 rounded-lg border border-purple-500/30 bg-purple-500/10 px-2.5 py-1.5 text-xs font-semibold text-purple-200 hover:bg-purple-500/20">
                              <Pencil className="h-3.5 w-3.5" /> Edit
                            </button>
                            <button type="button" onClick={() => router.push("/news/" + encodeURIComponent(art.title))} className="inline-flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-xs font-semibold text-slate-300 hover:text-white">
                              <ExternalLink className="h-3.5 w-3.5" /> Open
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>


          <section id="author-submissions" className="rounded-2xl border border-slate-800/80 bg-[#0c0e15] p-6 space-y-4 scroll-mt-24">
            <div>
              <h3 className="text-lg font-bold">Author submissions</h3>
              <p className="mt-1 text-xs text-slate-400">Review work submitted by the Author account before it appears in public news.</p>
            </div>
            {authorDraftsError && <p role="alert" className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 text-xs text-amber-200">{authorDraftsError}</p>}
            {authorDraftsLoading ? (
              <p className="text-sm text-slate-400">Loading Author submissions...</p>
            ) : authorDrafts.length === 0 ? (
              <p className="rounded-xl border border-slate-800 bg-slate-950/50 p-4 text-sm text-slate-400">No Author drafts or submissions are available. Draft storage must be configured before Authors can save work.</p>
            ) : (
              <div className="space-y-4">
                {authorDrafts.map((draft) => (
                  <article key={draft.id} className="rounded-xl border border-slate-800 bg-slate-950/50 p-4 space-y-3">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <h4 className="font-semibold text-white break-words">{draft.title}</h4>
                        <p className="mt-1 text-xs text-slate-400">{draft.category} · {draft.source} · Author: {draft.author}</p>
                      </div>
                      <span className={`w-fit shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${draft.status === "submitted" ? "border-cyan-500/30 bg-cyan-500/10 text-cyan-200" : draft.status === "revision_requested" ? "border-amber-500/30 bg-amber-500/10 text-amber-200" : draft.status === "published" ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200" : "border-slate-700 text-slate-300"}`}>
                        {draft.status.replace("_", " ")}
                      </span>
                    </div>
                    <p className="text-sm leading-6 text-slate-300">{draft.description || "No summary added."}</p>
                    <details className="rounded-lg border border-slate-800 px-3 py-2">
                      <summary className="cursor-pointer text-xs font-semibold text-slate-300">Read article draft</summary>
                      <div className="mt-3 whitespace-pre-wrap break-words text-sm leading-6 text-slate-300">{draft.content}</div>
                      {draft.sourceUrl && <a href={draft.sourceUrl} target="_blank" rel="noopener noreferrer" className="mt-3 inline-block text-xs text-cyan-300 underline">Open original source</a>}
                    </details>
                    {draft.feedback && (
                      <p className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 text-xs text-amber-100">Author feedback: {draft.feedback}</p>
                    )}
                    {draft.status === "submitted" && (
                      <div className="space-y-2 border-t border-slate-800 pt-3">
                        <label className="block text-xs text-slate-400">Feedback for the Author
                          <textarea rows={2} maxLength={1200} value={draftFeedback[draft.id] || ""} onChange={(event) => setDraftFeedback((current) => ({ ...current, [draft.id]: event.target.value }))} placeholder="Explain what needs to change..." className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-purple-500" />
                        </label>
                        <div className="flex flex-wrap gap-2">
                          <button type="button" onClick={() => void reviewAuthorDraft(draft, "request_revision")} disabled={Boolean(reviewingDraftId)} className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs font-semibold text-amber-200 disabled:opacity-50">Request changes</button>
                          <button type="button" onClick={() => void reviewAuthorDraft(draft, "publish")} disabled={Boolean(reviewingDraftId)} className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-500 disabled:opacity-50">{reviewingDraftId === draft.id ? "Working..." : "Publish article"}</button>
                        </div>
                      </div>
                    )}
                    {draft.status === "revision_requested" && (
                      <p className="text-xs text-slate-400">Waiting for the Author to make changes and submit again.</p>
                    )}
                    {draft.status === "published" && (
                      <p className="text-xs text-emerald-300">This article has been published to the public news feed.</p>
                    )}
                  </article>
                ))}
              </div>
            )}
          </section>

          <section id="automation-status" className="bg-[#0c0e15] border border-slate-800/80 rounded-2xl p-6 space-y-3 scroll-mt-24">
            <div>
              <h3 className="font-bold text-lg">News automation status</h3>
              <p className="text-xs text-slate-400 mt-1">This is what the current code actually contains; a successful live run has not been verified here.</p>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
                <p className="text-sm font-semibold text-amber-300">Scheduled headline publisher</p>
                <p className="text-xs text-slate-300 mt-2">The protected cron route checks the configured official source feeds and saves one eligible headline per run. It requires CRON_SECRET and the existing server-side database access.</p>
                <p className="text-[11px] text-slate-500 mt-2">The scheduler, server secrets and last successful run have not been verified from this dashboard.</p>
              </div>
              <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
                <p className="text-sm font-semibold text-amber-300">Category source coverage</p>
                <p className="text-xs text-slate-300 mt-2">Official feeds are configured for AI, Crypto, Policy, Technology and Leadership. Fox News stays as a direct publisher link rather than an automated RSS copy.</p>
                <p className="text-[11px] text-slate-500 mt-2">Individual feed uptime and the last successful collection time are not measured here yet.</p>
              </div>
              <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 md:col-span-2">
                <p className="text-sm font-semibold text-amber-300">Gemini AI drafting and classification</p>
                <p className="text-xs text-slate-300 mt-2">Headline classification uses the title and publisher only when Gemini is configured. Admin can request a draft from original notes or material they have permission to use; evidence excerpts are checked before a draft is returned.</p>
                <p className="text-[11px] text-slate-500 mt-2">AI drafts are not published automatically. The Admin must review and publish them. GEMINI_API_KEY configuration has not been checked by this dashboard.</p>
              </div>
            </div>
          </section>

          <section id="vector-status" className="bg-[#0c0e15] border border-slate-800/80 rounded-2xl p-6 scroll-mt-24">
            <h3 className="font-bold text-lg">Vector search</h3>
            <p className="text-xs text-amber-300 mt-2">Not implemented in this dashboard.</p>
            <p className="text-xs text-slate-400 mt-1">The previous Vector DB menu was only a placeholder. No working vector search controls are available here.</p>
          </section>

          <section id="security-status" className="bg-[#0c0e15] border border-slate-800/80 rounded-2xl p-6 scroll-mt-24">
            <h3 className="font-bold text-lg">Admin access</h3>
            <p className="text-xs text-emerald-300 mt-2">The Admin page checks a signed, time-limited server session.</p>
            <p className="text-xs text-slate-400 mt-1">A full database access-policy review has not been performed as part of this update.</p>
          </section>

          <section id="settings-status" className="bg-[#0c0e15] border border-slate-800/80 rounded-2xl p-6 scroll-mt-24">
            <h3 className="font-bold text-lg">Settings</h3>
            <p className="text-xs text-amber-300 mt-2">Site settings controls are not available in this dashboard yet.</p>
            <p className="text-xs text-slate-400 mt-1">No database or Supabase configuration was changed.</p>
          </section>

        </main>

          {editingArticle && (
            <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
              <section role="dialog" aria-modal="true" aria-labelledby="edit-article-title" className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-700 bg-[#0c0e15] p-5 shadow-2xl">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <h3 id="edit-article-title" className="text-lg font-bold text-white">Edit article</h3>
                    <p className="mt-1 text-xs text-slate-400">Changes are saved to this article record.</p>
                  </div>
                  <button type="button" onClick={() => { setEditingArticle(null); setEditError(""); }} className="rounded-lg bg-slate-800 p-2 text-slate-300 hover:text-white" aria-label="Close article editor">
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <form onSubmit={(event) => { event.preventDefault(); void saveArticleChanges(); }} className="space-y-3">
                  <label className="block text-xs text-slate-400">Headline
                    <input required maxLength={180} value={editForm.title} onChange={(event) => setEditForm((current) => ({ ...current, title: event.target.value }))} className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-purple-500" />
                  </label>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="block text-xs text-slate-400">Category
                      <select value={editForm.category} onChange={(event) => setEditForm((current) => ({ ...current, category: event.target.value }))} className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-purple-500">
                        {ADMIN_CATEGORIES.map((category) => <option key={category} value={category}>{category}</option>)}
                      </select>
                    </label>
                    <label className="block text-xs text-slate-400">Source name
                      <input required maxLength={120} value={editForm.source} onChange={(event) => setEditForm((current) => ({ ...current, source: event.target.value }))} className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-purple-500" />
                    </label>
                  </div>
                  <label className="block text-xs text-slate-400">Short summary
                    <textarea rows={3} maxLength={1000} value={editForm.description} onChange={(event) => setEditForm((current) => ({ ...current, description: event.target.value }))} className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-purple-500" />
                  </label>
                  <label className="block text-xs text-slate-400">Article text
                    <textarea required rows={9} maxLength={30000} value={editForm.content} onChange={(event) => setEditForm((current) => ({ ...current, content: event.target.value }))} className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm leading-6 text-white outline-none focus:border-purple-500" />
                    <span className="mt-1 block text-[11px] text-slate-500">Keep the source notes and article facts accurate. Existing NeuroWire article markers will be kept.</span>
                  </label>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="block text-xs text-slate-400">Original source link (HTTPS)
                      <input type="url" maxLength={2048} value={editForm.source_url} onChange={(event) => setEditForm((current) => ({ ...current, source_url: event.target.value }))} placeholder="https://publisher.com/story" className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-purple-500" />
                    </label>
                    <label className="block text-xs text-slate-400">Image link (HTTPS)
                      <input type="url" maxLength={2048} value={editForm.image_url} onChange={(event) => setEditForm((current) => ({ ...current, image_url: event.target.value }))} placeholder="https://..." className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-purple-500" />
                    </label>
                  </div>
                  {editError && <p role="alert" className="rounded-lg border border-rose-500/20 bg-rose-500/5 p-3 text-xs text-rose-300">{editError}</p>}
                  <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
                    <button type="button" onClick={() => { setEditingArticle(null); setEditError(""); }} disabled={editSaving} className="rounded-xl border border-slate-700 px-4 py-2.5 text-sm text-slate-300 hover:text-white disabled:opacity-50">Cancel</button>
                    <button type="submit" disabled={editSaving} className="rounded-xl bg-purple-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-purple-500 disabled:opacity-50">{editSaving ? "Saving changes..." : "Save changes"}</button>
                  </div>
                </form>
              </section>
            </div>
          )}
      </div>

    </div>
  );
}
