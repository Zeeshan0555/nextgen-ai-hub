"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createArticleForAuthor, getArticlesForAuthor, getPublishedNewsByAuthor, getSession } from '@/lib/news-workflow';

const emptyForm = {
  title: '',
  category: 'AI',
  summary: '',
  sourceName: '',
  sourceUrl: '',
  content: '',
  imageUrl: '',
  imageAlt: '',
};

export default function AuthorDashboardPage() {
  const router = useRouter();
  const [session, setSession] = useState<{ email: string; role: 'admin' | 'author'; approved: boolean } | null>(null);
  const [articles, setArticles] = useState<any[]>([]);
  const [published, setPublished] = useState<any[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const current = getSession();
    if (!current || current.role !== 'author') {
      router.push('/auth/login');
      return;
    }

    setSession(current);
    setArticles(getArticlesForAuthor(current.email));
    setPublished(getPublishedNewsByAuthor(current.email));
  }, [router]);

  const saveArticle = (status: 'draft' | 'pending_review') => {
    if (!session) return;
    if (!form.title || !form.summary || !form.content || !form.sourceName || !form.sourceUrl || !form.imageUrl) {
      setMessage('Title, summary, source, image, and full article content are required.');
      return;
    }

    const article = createArticleForAuthor({
      authorEmail: session.email,
      title: form.title,
      category: form.category,
      summary: form.summary,
      sourceName: form.sourceName,
      sourceUrl: form.sourceUrl,
      content: form.content,
      imageUrl: form.imageUrl,
      imageAlt: form.imageAlt || form.title,
      status,
    });

    setArticles((prev) => [article, ...prev]);
    setForm(emptyForm);
    setMessage(status === 'draft' ? 'Draft saved successfully.' : 'Article submitted for admin review.');
  };

  if (!session) return null;

  return (
    <div className="min-h-screen bg-[#060814] px-4 py-10 text-slate-100">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="flex flex-col gap-4 rounded-3xl border border-slate-800 bg-slate-900/80 p-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="mb-2 text-xs uppercase tracking-[0.3em] text-cyan-400">Author dashboard</p>
            <h1 className="text-3xl font-black text-white">Welcome, {session.email}</h1>
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

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <div className="text-xs uppercase tracking-[0.25em] text-slate-400">Drafts</div>
            <div className="mt-3 text-3xl font-black text-white">{articles.filter((item) => item.status === 'draft').length}</div>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <div className="text-xs uppercase tracking-[0.25em] text-slate-400">Pending</div>
            <div className="mt-3 text-3xl font-black text-cyan-300">{articles.filter((item) => item.status === 'pending_review').length}</div>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <div className="text-xs uppercase tracking-[0.25em] text-slate-400">Published</div>
            <div className="mt-3 text-3xl font-black text-emerald-300">{published.length}</div>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6">
            <h2 className="mb-5 text-2xl font-bold text-white">Write a new article</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Article title" className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-cyan-500" />
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white focus:border-cyan-500">
                <option value="AI">AI</option>
                <option value="Crypto">Crypto</option>
                <option value="Policy">Policy</option>
                <option value="Markets">Markets</option>
              </select>
            </div>

            <textarea value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} rows={3} placeholder="Short summary" className="mt-4 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-cyan-500" />

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <input value={form.sourceName} onChange={(e) => setForm({ ...form, sourceName: e.target.value })} placeholder="Source name" className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-cyan-500" />
              <input value={form.sourceUrl} onChange={(e) => setForm({ ...form, sourceUrl: e.target.value })} placeholder="Source URL" className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-cyan-500" />
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <input value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} placeholder="Image URL" className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-cyan-500" />
              <input value={form.imageAlt} onChange={(e) => setForm({ ...form, imageAlt: e.target.value })} placeholder="Image alt text" className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-cyan-500" />
            </div>

            <textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={14} placeholder="Write your full article here. Minimum 500 words, natural tone, factual clarity, source-based reporting, and human-like writing are required." className="mt-4 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-cyan-500" />

            <div className="mt-5 flex flex-wrap gap-3">
              <button onClick={() => saveArticle('draft')} className="rounded-xl border border-slate-700 bg-slate-950 px-5 py-3 text-sm font-semibold text-slate-200 hover:border-slate-500 hover:text-white">Save draft</button>
              <button onClick={() => saveArticle('pending_review')} className="rounded-xl bg-cyan-500 px-5 py-3 text-sm font-bold text-black hover:bg-cyan-400">Submit for review</button>
            </div>

            {message && <div className="mt-4 rounded-xl border border-cyan-500/30 bg-cyan-500/10 p-4 text-sm text-cyan-200">{message}</div>}
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6">
            <h2 className="mb-5 text-2xl font-bold text-white">Your submissions</h2>
            <div className="space-y-4">
              {articles.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-700 p-5 text-sm text-slate-400">No article drafts yet.</div>
              ) : (
                articles.map((item) => (
                  <div key={item.id} className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-sm font-bold text-white">{item.title}</div>
                      <span className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-cyan-300">{item.status}</span>
                    </div>
                    <div className="mt-2 text-xs text-slate-400">{item.category} • {new Date(item.createdAt).toLocaleDateString()}</div>
                    <div className="mt-3 text-xs text-slate-300">{item.summary}</div>
                    {item.adminFeedback && <div className="mt-3 rounded-lg border border-amber-500/30 bg-amber-500/10 p-2 text-[11px] text-amber-200">{item.adminFeedback}</div>}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
path":"app/author/page.tsx"},{