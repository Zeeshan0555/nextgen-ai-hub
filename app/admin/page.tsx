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
  TrendingUp, 
  Zap, 
  Globe, 
  Clock 
} from 'lucide-react';

interface Article {
  id: string;
  title: string;
  category: string;
  published_at: string;
}

export default function AdminDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchArticles() {
      try {
        const { data, error } = await supabase
          .from('news_articles')
          .select('id, title, category, published_at')
          .order('published_at', { ascending: false })
          .limit(5);

        if (error) {
          console.error('Error fetching articles:', error);
        } else if (data) {
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
              <p className="text-xs text-purple-400 flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span> System Online
              </p>
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
              <h2 className="text-xl font-bold tracking-wide">Welcome back, Zeeshan</h2>
              <p className="text-xs text-slate-400">Autonomous RSS feed & vector search running stable.</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300">
              <Clock className="h-3.5 w-3.5 text-cyan-400" />
              <span>2:37 AM Today</span>
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-purple-600/20 border border-purple-500/30 text-purple-300 text-xs font-semibold animate-pulse">
              Live Feed Active
            </div>
          </div>
        </header>

        <main className="p-6 space-y-6 flex-1">
          {/* Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#0c0e15] border border-slate-800/80 rounded-2xl p-5 relative overflow-hidden">
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total Articles</p>
              <h3 className="text-3xl font-extrabold mt-2 tracking-tight">50.8K</h3>
              <p className="text-xs text-emerald-400 mt-2 flex items-center gap-1 font-medium">
                <TrendingUp className="h-3.5 w-3.5" /> +14.2% from last week
              </p>
            </div>

            <div className="bg-[#0c0e15] border border-slate-800/80 rounded-2xl p-5 relative overflow-hidden">
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">AI Processed</p>
              <h3 className="text-3xl font-extrabold mt-2 tracking-tight">23.6K</h3>
              <p className="text-xs text-cyan-400 mt-2 flex items-center gap-1 font-medium">
                <Zap className="h-3.5 w-3.5" /> 99.8% Accuracy
              </p>
            </div>

            <div className="bg-[#0c0e15] border border-slate-800/80 rounded-2xl p-5 relative overflow-hidden">
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Vector Embeddings</p>
              <h3 className="text-3xl font-extrabold mt-2 tracking-tight">756</h3>
              <p className="text-xs text-purple-400 mt-2 flex items-center gap-1 font-medium">
                <Database className="h-3.5 w-3.5" /> pgvector indexed
              </p>
            </div>

            <div className="bg-[#0c0e15] border border-slate-800/80 rounded-2xl p-5 relative overflow-hidden">
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">System Status</p>
              <h3 className="text-3xl font-extrabold mt-2 tracking-tight text-emerald-400">100%</h3>
              <p className="text-xs text-slate-400 mt-2 flex items-center gap-1 font-medium">
                <Globe className="h-3.5 w-3.5" /> Vercel Edge Deployed
              </p>
            </div>
          </div>

          {/* Real Supabase Database Stream Table */}
          <div className="bg-[#0c0e15] border border-slate-800/80 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-lg">Live Supabase News Stream</h3>
                <p className="text-xs text-slate-400">Real-time database records from public.news_articles</p>
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
                        Connecting to Supabase pgvector stream...
                      </td>
                    </tr>
                  ) : articles.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-6 text-center text-slate-500 text-xs">
                        No articles found in database yet. Ready for AI Ingestion Engine.
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
                          <span className="flex items-center gap-1.5 text-emerald-400 text-xs">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span> Live
                          </span>
                        </td>
                        <td className="py-3 px-4 text-xs text-slate-400">
                          {new Date(art.published_at).toLocaleDateString()}
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
