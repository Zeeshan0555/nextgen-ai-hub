"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminLogin, loginAuthor } from '@/lib/news-workflow';

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      if (form.email.toLowerCase() === 'admin@neurowire.local' || form.email.toLowerCase().includes('admin')) {
        adminLogin(form.email, form.password);
        router.push('/admin');
        return;
      }

      loginAuthor(form.email, form.password);
      router.push('/author');
    } catch (error: any) {
      setMessage(error.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#060814] px-4 py-16 text-slate-100">
      <div className="mx-auto max-w-md rounded-3xl border border-slate-800 bg-slate-900/80 p-8 shadow-2xl">
        <p className="mb-2 text-xs uppercase tracking-[0.3em] text-cyan-400">NeuroWire</p>
        <h1 className="text-3xl font-black text-white">Author Login</h1>
        <p className="mt-2 text-sm text-slate-400">Login as an approved author or use admin credentials to review the newsroom.</p>

        <form onSubmit={handleLogin} className="mt-8 space-y-5">
          <input
            required
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="Email address"
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-500"
          />
          <input
            required
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            placeholder="Password"
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-500"
          />

          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => router.push('/auth/signup')}
              className="rounded-xl border border-slate-700 px-4 py-3 text-sm text-slate-200 transition hover:border-slate-500 hover:text-white"
            >
              Create author account
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-cyan-500 px-5 py-3 text-sm font-bold text-black transition hover:bg-cyan-400 disabled:opacity-60"
            >
              {loading ? 'Checking...' : 'Login'}
            </button>
          </div>
        </form>

        {message && <div className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">{message}</div>}

        <div className="mt-6 rounded-xl border border-slate-700 bg-slate-950/60 p-4 text-xs text-slate-400">
          Demo admin:
          <div className="mt-2 font-mono text-cyan-300">admin@neurowire.local / admin123</div>
        </div>
      </div>
    </div>
  );
}
path":"app/auth/login/page.tsx"},{