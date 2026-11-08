"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  adminLogin,
  approveAuthorApplication,
  getAuthorApplications,
  getAuthorArticles,
  getPublishedNews,
  getSession,
  publishArticleToNews,
  updateArticleStatus,
} from '@/lib/news-workflow';

export default function AdminPage() {
  const router = useRouter();
  const [session, setSession] = useState<{ email: string; role: 'admin' | 'author'; approved: boolean } | null>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [articles, setArticles] = useState<any[]>([]);
  const [publishedNews, setPublishedNews] = useState<any[]>([]);
  const [loginForm, setLoginForm] = useState({ email: 'admin@neurowire.local', password: 'admin123' });
  const [message, setMessage] = useState('');

  useEffect(() => {
    const current = getSession();
    if (current && current.role === 'admin') {
      setSession(current);
      loadData();
    }
  }, []);

  const loadData = () => {
    setApplications(getAuthorApplications());
    setArticles(getAuthorArticles());
    setPublishedNews(getPublishedNews());
  };

  const handleAdminLogin = (event: React.FormEvent) => {
    event.preventDefault();
    try {
      adminLogin(loginForm.email, loginForm.password);
      setSession({ email: loginForm.email, role: 'admin', approved: true });
      loadData();
      setMessage('Admin session active.');
    } catch (error: any) {
      setMessage(error.message || 'Admin login failed.');
    }
  };

  const handleApplicationDecision = (appId: string, approved: boolean) => {
    approveAuthorApplication(appId, approved, approved ? 'Approved by admin.' : 'Rejected by admin.');
    loadData();
    setMessage(approved ? 'Author application approved.' : 'Author application rejected.');
  };

  const handleArticleDecision = (articleId: string, action: 'approve' | 'reject' | 'publish', feedback = '') => {
    if (action === 'approve') {
      updateArticleStatus(articleId, 'approved', feedback || 'Approved by admin.');
      setMessage('Article approved for publication.');
    }

    if (action === 'reject') {
      updateArticleStatus(articleId, 'rejected', feedback || 'Editorial feedback: please tighten sourcing and improve clarity.');
      setMessage('Article rejected and returned to author.');
    }

    if (action === 'publish') {
      publishArticleToNews(articleId);
      setMessage('Article published live to the newsroom.');
    }

    loadData();
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-[#060814] px-4 py-16 text-slate-100">
        <div className="mx-auto max-w-md rounded-3xl border border-slate-800 bg-slate-900/80 p-8 shadow-2xl">
          <p className="mb-2 text-xs uppercase tracking-[0.3em] text-cyan-400">Admin console</p>
          <h1 className="text-3xl font-black text-white">Login</h1>
          <form onSubmit={handleAdminLogin} className="mt-8 space-y-5">
            <input
              value={loginForm.email}
              onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-cyan-500"
            />
            <input
              type="password"
              value={loginForm.password}
              onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-cyan-500"
            />
            <button type="submit" className="w-full rounded-xl bg-cyan-500 px-5 py-3 text-sm font-bold text-black hover:bg-cyan-400">Access admin dashboard</button>
          </form>
          {message && <div className="mt-4 rounded-xl border border-cyan-500/30 bg-cyan-500/10 p-4 text-sm text-cyan-200">{message}</div>}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#060814] px-4 py-10 text-slate-100">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="flex flex-col gap-4 rounded-3xl border border-slate-800 bg-slate-900/80 p-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="mb-2 text-xs uppercase tracking-[0.3em] text-cyan-400">Admin console</p>
            <h1 className="text-3xl font-black text-white">Editorial control center</h1>
          </div>
          <button
            onClick={() => {
              localStorage.removeItem('neurowire_session');
              router.push('/auth/login');
            }}
            className="rounded-xl border border-slate-700 px-4 py-2 text-sm text-slate-200 hover:border-slate-500 hover:text-white"
          >
            Logout
          </button>
        </div>

        {message && <div className="rounded-xl border border-cyan-500/30 bg-cyan-500/10 p-4 text-sm text-cyan-200">{message}</div>}

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6">
            <h2 className="mb-5 text-2xl font-bold text-white">Pending author applications</h2>
            <div className="space-y-4">
              {applications.filter((item) => item.status === 'pending').length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-700 p-4 text-sm text-slate-400">No pending applications.</div>
              ) : (
                applications.filter((item) => item.status === 'pending').map((item) => (
                  <div key={item.id} className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="text-base font-bold text-white">{item.fullName}</div>
                        <div className="text-xs text-slate-400">{item.email}</div>
                      </div>
                      <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-amber-300">Pending</span>
                    </div>
                    <div className="mt-3 text-sm text-slate-300">{item.bio}</div>
                    <div className="mt-2 text-xs text-cyan-300">Expertise: {item.expertise}</div>
                    {item.portfolioUrl && <div className="mt-2 text-xs text-slate-400">Portfolio: {item.portfolioUrl}</div>}
                    <div className="mt-4 flex gap-2">
                      <button onClick={() => handleApplicationDecision(item.id, true)} className="rounded-xl bg-cyan-500 px-4 py-2 text-xs font-bold text-black hover:bg-cyan-400">Approve</button>
                      <button onClick={() => handleApplicationDecision(item.id, false)} className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-xs font-bold text-red-200 hover:bg-red-500/20">Reject</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6">
            <h2 className="mb-5 text-2xl font-bold text-white">Live newsroom</h2>
            <div className="space-y-4">
              {publishedNews.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-700 p-4 text-sm text-slate-400">No published articles yet.</div>
              ) : (
                publishedNews.map((item) => (
                  <div key={item.id} className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                    <div className="text-base font-bold text-white">{item.title}</div>
                    <div className="mt-2 text-xs uppercase tracking-[0.2em] text-cyan-300">{item.category}</div>
                    <div className="mt-2 text-sm text-slate-300">{item.summary}</div>
                    <div className="mt-2 text-[11px] text-slate-400">Source: {item.source}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6">
          <h2 className="mb-5 text-2xl font-bold text-white">Article review queue</h2>
          <div className="space-y-4">
            {articles.filter((item) => item.status === 'pending_review' || item.status === 'approved' || item.status === 'rejected').length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-700 p-4 text-sm text-slate-400">No article submissions in the queue.</div>
            ) : (
              articles.filter((item) => item.status === 'pending_review' || item.status === 'approved' || item.status === 'rejected').map((item) => (
                <div key={item.id} className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <div className="text-base font-bold text-white">{item.title}</div>
                      <div className="mt-1 text-xs text-slate-400">{item.authorEmail} • {item.category} • {item.status}</div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button onClick={() => handleArticleDecision(item.id, 'approve')} className="rounded-xl bg-cyan-500 px-4 py-2 text-xs font-bold text-black hover:bg-cyan-400">Approve</button>
                      <button onClick={() => handleArticleDecision(item.id, 'reject')} className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-xs font-bold text-red-200 hover:bg-red-500/20">Reject</button>
                      <button onClick={() => handleArticleDecision(item.id, 'publish')} className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-xs font-bold text-emerald-200 hover:bg-emerald-500/20">Publish</button>
                    </div>
                  </div>
                  <div className="mt-3 text-sm text-slate-300">{item.summary}</div>
                  <div className="mt-3 text-xs text-slate-400">Source: {item.sourceName} • {item.sourceUrl}</div>
                  {item.adminFeedback && <div className="mt-3 rounded-lg border border-amber-500/30 bg-amber-500/10 p-2 text-[11px] text-amber-200">{item.adminFeedback}</div>}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
path":"app/admin/page.tsx"}]}  