"use client";

import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, BookOpen, CheckCircle2, FilePlus2, LogOut, Save, Send } from "lucide-react";

const CATEGORIES = ["AI", "Crypto", "Policy", "Technology", "Fox News", "Leadership"] as const;

type DraftStatus = "draft" | "submitted" | "revision_requested" | "published";
type Draft = {
  id: string;
  title: string;
  category: string;
  source: string;
  sourceUrl: string;
  description: string;
  content: string;
  imageUrl: string;
  status: DraftStatus;
  feedback: string;
  author: string;
  createdAt: string;
  updatedAt: string;
};

type DraftForm = Omit<Draft, "id" | "status" | "feedback" | "author" | "createdAt" | "updatedAt">;
const EMPTY_FORM: DraftForm = {
  title: "",
  category: "AI",
  source: "",
  sourceUrl: "",
  description: "",
  content: "",
  imageUrl: "",
};

export default function AuthorWorkspace() {
  const [checking, setChecking] = useState(true);
  const [configured, setConfigured] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [draftsError, setDraftsError] = useState("");
  const [loadingDrafts, setLoadingDrafts] = useState(false);
  const [form, setForm] = useState<DraftForm>(EMPTY_FORM);
  const [editingId, setEditingId] = useState("");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [notice, setNotice] = useState("");

  const loadDrafts = useCallback(async () => {
    setLoadingDrafts(true);
    setDraftsError("");
    try {
      const response = await fetch("/api/author/drafts", { cache: "no-store" });
      const payload = await response.json();
      if (!response.ok || !payload.success || !Array.isArray(payload.drafts)) {
        throw new Error(typeof payload.error === "string" ? payload.error : "Your drafts could not be loaded.");
      }
      setDrafts(payload.drafts as Draft[]);
    } catch (error) {
      setDraftsError(error instanceof Error ? error.message : "Your drafts could not be loaded.");
    } finally {
      setLoadingDrafts(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    fetch("/api/author/session", { cache: "no-store" })
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok) throw new Error("Author sign-in could not be checked.");
        if (!active) return;
        setConfigured(Boolean(payload.configured));
        setAuthenticated(Boolean(payload.isAuthenticated));
      })
      .catch(() => {
        if (active) setLoginError("Author sign-in could not be checked. Refresh and try again.");
      })
      .finally(() => {
        if (active) setChecking(false);
      });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (authenticated) void loadDrafts();
  }, [authenticated, loadDrafts]);

  const signIn = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoginError("");
    setChecking(true);
    try {
      const response = await fetch("/api/author/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const payload = await response.json();
      if (!response.ok || !payload.success) {
        throw new Error(typeof payload.error === "string" ? payload.error : "Author sign-in failed.");
      }
      setAuthorName(typeof payload.username === "string" ? payload.username : username);
      setPassword("");
      setAuthenticated(true);
    } catch (error) {
      setLoginError(error instanceof Error ? error.message : "Author sign-in failed.");
    } finally {
      setChecking(false);
    }
  };

  const signOut = async () => {
    setChecking(true);
    try {
      await fetch("/api/author/session", { method: "DELETE" });
      setAuthenticated(false);
      setDrafts([]);
      setEditingId("");
      setForm(EMPTY_FORM);
      setNotice("");
    } finally {
      setChecking(false);
    }
  };

  const startEdit = (draft: Draft) => {
    setEditingId(draft.id);
    setForm({
      title: draft.title,
      category: draft.category as DraftForm["category"],
      source: draft.source,
      sourceUrl: draft.sourceUrl,
      description: draft.description,
      content: draft.content,
      imageUrl: draft.imageUrl,
    });
    setFormError("");
    setNotice("");
  };

  const resetForm = () => {
    setEditingId("");
    setForm(EMPTY_FORM);
    setFormError("");
    setNotice("");
  };

  const saveDraft = async (action: "save" | "submit" | "resubmit") => {
    if (saving) return;
    setSaving(true);
    setFormError("");
    setNotice("");
    try {
      const response = await fetch("/api/author/drafts", {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, id: editingId || undefined, action }),
      });
      const payload = await response.json();
      if (!response.ok || !payload.success || !payload.draft) {
        throw new Error(typeof payload.error === "string" ? payload.error : "The draft could not be saved.");
      }
      const savedDraft = payload.draft as Draft;
      setDrafts((current) => {
        const exists = current.some((draft) => draft.id === savedDraft.id);
        return exists
          ? current.map((draft) => draft.id === savedDraft.id ? savedDraft : draft)
          : [savedDraft, ...current];
      });
      setEditingId(savedDraft.id);
      setNotice(action === "save" ? "Draft saved on the private Author workspace." : "Article submitted to the Admin for review.");
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "The draft could not be saved.");
    } finally {
      setSaving(false);
    }
  };

  const statusLabel = (status: DraftStatus) => status.replace("_", " ");

  return (
    <main className="min-h-screen bg-[#070b14] px-4 py-8 text-slate-100 sm:px-6">
      <div className="mx-auto max-w-5xl space-y-6">
        <a href="/" className="inline-flex items-center gap-2 text-sm text-cyan-300 hover:text-cyan-200">
          <ArrowLeft className="h-4 w-4" /> Back to news
        </a>

        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-cyan-400">NeuroWire Newsroom</p>
            <h1 className="mt-2 text-3xl font-bold text-white">Author workspace</h1>
            <p className="mt-2 text-sm text-slate-400">Write a story, save your draft and send it to the Admin for review.</p>
          </div>
          {authenticated && (
            <button type="button" onClick={() => void signOut()} disabled={checking} className="inline-flex items-center gap-2 rounded-xl border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white disabled:opacity-50">
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          )}
        </header>

        {checking && <p className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 text-sm text-slate-400">Checking Author access...</p>}

        {!checking && !authenticated && (
          <section className="mx-auto max-w-md rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
            <h2 className="text-xl font-semibold text-white">Author sign in</h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">Use the Author account details provided by the NeuroWire Admin.</p>
            {!configured && (
              <p className="mt-4 rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 text-xs leading-5 text-amber-200">
                Author access has not been configured on this deployment yet. The Admin must add the Author sign-in and encryption settings before the workspace can be used.
              </p>
            )}
            {loginError && <p role="alert" className="mt-4 text-xs text-rose-300">{loginError}</p>}
            <form onSubmit={signIn} className="mt-5 space-y-3">
              <label className="block text-xs text-slate-400">Username
                <input required autoComplete="username" value={username} onChange={(event) => setUsername(event.target.value)} className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-500" />
              </label>
              <label className="block text-xs text-slate-400">Password
                <input required type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-500" />
              </label>
              <button type="submit" disabled={!configured || checking} className="w-full rounded-xl bg-cyan-500 px-4 py-3 text-sm font-semibold text-slate-950 hover:bg-cyan-400 disabled:opacity-50">Sign in</button>
            </form>
          </section>
        )}

        {!checking && authenticated && (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(280px,0.9fr)]">
            <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 sm:p-6">
              <div className="mb-5 flex items-center gap-2">
                <FilePlus2 className="h-5 w-5 text-cyan-400" />
                <h2 className="text-lg font-semibold text-white">{editingId ? "Edit your article" : "Write a new article"}</h2>
              </div>
              {formError && <p role="alert" className="mb-4 rounded-lg border border-rose-500/20 bg-rose-500/5 p-3 text-xs text-rose-300">{formError}</p>}
              {notice && <p role="status" aria-live="polite" className="mb-4 rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3 text-xs text-emerald-200">{notice}</p>}
              <form onSubmit={(event) => { event.preventDefault(); void saveDraft("save"); }} className="space-y-3">
                <label className="block text-xs text-slate-400">Headline
                  <input required minLength={8} maxLength={180} value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-500" />
                </label>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="block text-xs text-slate-400">Category
                    <select value={form.category} onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))} className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-500">
                      {CATEGORIES.map((category) => <option key={category} value={category}>{category}</option>)}
                    </select>
                  </label>
                  <label className="block text-xs text-slate-400">Source name
                    <input required maxLength={120} value={form.source} onChange={(event) => setForm((current) => ({ ...current, source: event.target.value }))} className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-500" />
                  </label>
                </div>
                <label className="block text-xs text-slate-400">Original source link (HTTPS)
                  <input type="url" maxLength={2048} value={form.sourceUrl} onChange={(event) => setForm((current) => ({ ...current, sourceUrl: event.target.value }))} placeholder="https://publisher.com/story" className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-500" />
                </label>
                <label className="block text-xs text-slate-400">Image link (HTTPS, optional)
                  <input type="url" maxLength={2048} value={form.imageUrl} onChange={(event) => setForm((current) => ({ ...current, imageUrl: event.target.value }))} placeholder="https://..." className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-500" />
                </label>
                <label className="block text-xs text-slate-400">Short summary
                  <textarea rows={3} maxLength={1000} value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-500" />
                </label>
                <label className="block text-xs text-slate-400">Article text
                  <textarea required minLength={40} rows={12} maxLength={30000} value={form.content} onChange={(event) => setForm((current) => ({ ...current, content: event.target.value }))} placeholder={"## What happened\n\nExplain the main event in your own words...\n\n## Key details\n\nAdd confirmed facts and source evidence...\n\n## Why it matters\n\nExplain the wider impact...\n\n## What the source does not tell us\n\nState any important gaps or uncertainty..."} className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm leading-6 text-white outline-none focus:border-cyan-500" />
                  <span className="mt-1 block text-[11px] leading-5 text-slate-500">Use your own clear wording. Add source evidence and explain what is not yet known. The Admin checks article quality before publication.</span>
                </label>
                <div className="flex flex-col gap-2 pt-2 sm:flex-row">
                  <button type="submit" disabled={saving} className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-700 disabled:opacity-50">
                    <Save className="h-4 w-4" /> {saving ? "Saving..." : "Save draft"}
                  </button>
                  <button type="button" onClick={() => void saveDraft(editingId && drafts.find((draft) => draft.id === editingId)?.status === "revision_requested" ? "resubmit" : "submit")} disabled={saving} className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-cyan-500 px-4 py-3 text-sm font-semibold text-slate-950 hover:bg-cyan-400 disabled:opacity-50">
                    <Send className="h-4 w-4" /> {saving ? "Sending..." : "Submit for review"}
                  </button>
                </div>
                {editingId && <button type="button" onClick={resetForm} disabled={saving} className="w-full rounded-xl py-2 text-xs text-slate-400 hover:text-white disabled:opacity-50">Cancel editing</button>}
              </form>
            </section>

            <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 sm:p-6">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-white">Your articles</h2>
                  <p className="mt-1 text-xs text-slate-400">{authorName || "Author account"} · private drafts and submissions</p>
                </div>
                <BookOpen className="h-5 w-5 text-cyan-400" />
              </div>
              {draftsError && <p role="alert" className="mb-3 text-xs text-rose-300">{draftsError}</p>}
              {loadingDrafts ? <p className="text-sm text-slate-400">Loading drafts...</p> : drafts.length === 0 ? (
                <p className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 text-sm text-slate-400">You have no drafts yet. Start with your first article.</p>
              ) : (
                <div className="space-y-3">
                  {drafts.map((draft) => (
                    <article key={draft.id} className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                      <h3 className="font-semibold leading-5 text-white">{draft.title}</h3>
                      <p className="mt-1 text-xs text-slate-500">{draft.category} · {draft.source}</p>
                      <span className={`mt-3 inline-block rounded-full border px-2.5 py-1 text-[11px] font-semibold ${draft.status === "published" ? "border-emerald-500/30 text-emerald-200" : draft.status === "submitted" ? "border-cyan-500/30 text-cyan-200" : draft.status === "revision_requested" ? "border-amber-500/30 text-amber-200" : "border-slate-700 text-slate-300"}`}>{draft.status.replace("_", " ")}</span>
                      {draft.feedback && <p className="mt-3 rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 text-xs leading-5 text-amber-100">Admin feedback: {draft.feedback}</p>}
                      {draft.status !== "published" && (
                        <button type="button" onClick={() => startEdit(draft)} className="mt-3 block rounded-lg border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white">Edit draft</button>
                      )}
                      {draft.status === "published" && <p className="mt-3 inline-flex items-center gap-1.5 text-xs text-emerald-300"><CheckCircle2 className="h-4 w-4" /> Published by the newsroom</p>}
                    </article>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </div>
    </main>
  );
}
