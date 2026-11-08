"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { registerAuthorApplication } from '@/lib/news-workflow';

export default function AuthorSignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    bio: '',
    expertise: '',
    portfolioUrl: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      registerAuthorApplication(form);
      setMessage('Application submitted successfully. Admin approval is required before you can publish articles.');
      setTimeout(() => router.push('/auth/login'), 1200);
    } catch (error: any) {
      setMessage(error.message || 'Unable to register author.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#060814] text-slate-100 px-4 py-16">
      <div className="mx-auto max-w-3xl rounded-3xl border border-slate-800 bg-slate-900/80 p-8 shadow-2xl">
        <div className="mb-8">
          <p className="mb-2 text-xs uppercase tracking-[0.3em] text-cyan-400">NeuroWire</p>
          <h1 className="text-3xl font-black text-white">Author Sign Up</h1>
          <p className="mt-2 text-sm text-slate-400">Create your author profile. Admin approval is mandatory before your articles are visible on the live newsroom.</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-5">
          <div className="grid gap-5 md:grid-cols-2">
            <input
              required
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              placeholder="Full name"
              className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none ring-0 placeholder:text-slate-500 focus:border-cyan-500"
            />
            <input
              required
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="Email address"
              className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-500"
            />
          </div>

          <input
            required
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            placeholder="Choose a password"
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-500"
          />

          <textarea
            required
            value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
            rows={4}
            placeholder="Write your author bio. Mention your reporting style, strengths, and newsroom experience."
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-500"
          />

          <div className="grid gap-5 md:grid-cols-2">
            <input
              required
              value={form.expertise}
              onChange={(e) => setForm({ ...form, expertise: e.target.value })}
              placeholder="Area of expertise"
              className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-500"
            />
            <input
              type="url"
              value={form.portfolioUrl}
              onChange={(e) => setForm({ ...form, portfolioUrl: e.target.value })}
              placeholder="Portfolio / website (optional)"
              className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-500"
            />
          </div>

          <div className="flex items-center justify-between gap-3 pt-3">
            <button
              type="button"
              onClick={() => router.push('/auth/login')}
              className="rounded-xl border border-slate-700 px-5 py-3 text-sm text-slate-200 transition hover:border-slate-500 hover:text-white"
            >
              Back to login
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-cyan-500 px-6 py-3 text-sm font-bold text-black transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Submitting...' : 'Submit application'}
            </button>
          </div>
        </form>

        {message && (
          <div className="mt-6 rounded-xl border border-cyan-500/30 bg-cyan-500/10 p-4 text-sm text-cyan-200">
            {message}
          </div>
        )}
      </div>
    </div>
  );
}
path":"app/auth/signup/page.tsx"},{