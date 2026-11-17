'use client';

import React, { useState, useEffect } from 'react';
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
  Zap 
} from 'lucide-react';

interface Article {
  id: string;
  title: string;
  category: string;
  created_at?: string | null;
}

export default function AdminDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [articleError, setArticleError] = useState(false);
  const [marketStatus, setMarketStatus] = useState<"checking" | "available" | "unavailable">("checking");
  const [marketQuoteCount, setMarketQuoteCount] = useState(0);
  const [marketFetchedAt, setMarketFetchedAt] = useState<string | null>(null);

  useEffect(() => {
    async function fetchArticles() {
      try {
        const { data, error } = await supabase
          .from('news')
          .select('id, title, category, created_at')
          .order('created_at', { ascending: false })
          .limit(5);

        if (error) {
          setArticleError(true);
          console.error('Error fetching articles:', error);
        } else if (data) {
          setArticleError(false);
          setArticles(data);
        }
      } catch (err) {
        console.error('Unexpected error:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchArticles();
  }, []);

  useEffect(() => {
    let active = true;

    async function checkMarketFeed() {
      try {
        const response = await fetch("/api/market", { cache: "no-store" });
        if (!response.ok) throw new Error("Market feed unavailable");

        const payload: { success?: boolean; quotes?: unknown[]; fetchedAt?: string } = await response.json();
        if (!payload.success || !Array.isArray(payload.quotes)) {
          throw new Error("Market feed response was not valid");
        }

        if (active) {
          setMarketQuoteCount(payload.quotes.length);
          setMarketFetchedAt(typeof payload.fetchedAt === "string" ? payload.fetchedAt : null);
          setMarketStatus("available");
        }
      } catch {
        if (active) setMarketStatus("unavailable");
      }
    }

    checkMarketFeed();
    const intervalId = window.setInterval(checkMarketFeed, 60_000);

    return () => {
      active = false;
      window.clearInterval(intervalId);
    };
  }, []);

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

        <nav className="p-4 space-y-1.5 flex-1">
          <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-purple-600/10 text-purple-400 border border-purple-500/20 font-medium">
            <LayoutDashboard className="h-5 w-5" /> Dashboard
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/40">
            <FileText className="h-5 w-5" /> CMS Articles
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/40">
            <Cpu className="h-5 w-5" /> AI Automation
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/40">
            <Database className="h-5 w-5" /> Vector DB (pgvector)
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/40">
            <ShieldCheck className="h-5 w-5" /> Security & RLS
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/40">
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
              <p className="text-xs text-slate-400">Recent article records and public market feed status.</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 text-xs font-medium">
              Admin workspace
            </div>
          </div>
        </header>

        <main className="p-6 space-y-6 flex-1">
          {/* Live overview based only on data this page can verify */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Public Market Feed</p>
              <h3 className={`text-2xl font-extrabold mt-2 tracking-tight ${marketStatus === "available" ? "text-emerald-400" : marketStatus === "unavailable" ? "text-amber-400" : "text-slate-300"}`}>
                {marketStatus === "checking" ? "Checking" : marketStatus === "available" ? "Available" : "Unavailable"}
              </h3>
              <p className="text-xs text-slate-400 mt-2">
                {marketQuoteCount} quote pairs returned
                {marketFetchedAt ? ` · ${new Date(marketFetchedAt).toLocaleTimeString()}` : ""}
              </p>
            </div>

            <div className="bg-[#0c0e15] border border-slate-800/80 rounded-2xl p-5 relative overflow-hidden">
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Latest Publication</p>
              <h3 className="text-lg font-extrabold mt-2 tracking-tight">
                {loading ? "Loading" : articleError ? "Unavailable" : articles[0]?.created_at && !Number.isNaN(Date.parse(articles[0].published_at)) ? new Date(articles[0].published_at).toLocaleDateString() : "Not available"}
              </h3>
              <p className="text-xs text-slate-400 mt-2 line-clamp-2">
                {articles[0]?.title || "No recent article title available"}
              </p>
            </div>
          </div>

          {/* Recent article records */}
          <div className="bg-[#0c0e15] border border-slate-800/80 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-lg">Recent News Articles</h3>
                <p className="text-xs text-slate-400">Latest five records returned by the connected news table</p>
              </div>
              <button 
                onClick={() => window.location.reload()}
                className="px-3 py-1.5 rounded-lg bg-purple-600/20 text-purple-400 text-xs font-semibold border border-purple-500/30 hover:bg-purple-600/30 transition-all"
              >
                Refresh Data
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="border-b border-slate-800 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="py-3 px-4">Article Title</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {loading ? (
                    <tr>
                      <td colSpan={4} className="py-6 text-center text-slate-500 text-xs">
                        Loading recent articles...
                      </td>
                    </tr>
                  ) : articles.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-6 text-center text-slate-500 text-xs">
                        No recent articles were returned.
                      </td>
                    </tr>
                  ) : (
                    articles.map((art) => (
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
                            {art.created_at && !Number.isNaN(Date.parse(art.created_at)) ? "Published" : "Date unavailable"}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-xs text-slate-400">
                          {art.created_at && !Number.isNaN(Date.parse(art.created_at))
                            ? new Date(art.created_at).toLocaleDateString()
                            : "Date unavailable"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </main>
      </div>

    </div>
  );
}
