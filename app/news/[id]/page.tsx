"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { CheckCircle2, ArrowLeft, Lock, ShieldCheck } from "lucide-react";

export default function ArticlePage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;

  const [story, setStory] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
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
    async function fetchStory() {
      try {
        const res = await fetch("/api/news");
        const data = await res.json();
        const found = data.news?.[Number(id)] || null;
        setStory(found);
      } catch (err) {
        console.error("Failed to fetch story", err);
      } finally {
        setLoading(false);
      }
    }
    if (id !== undefined) {
      fetchStory();
    }
  }, [id]);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailInput }),
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem("neurowire_sub", "true");
        setIsSubscribed(true);
        setSubMessage("Access Granted!");
      } else {
        setSubMessage(data.error || "Something went wrong");
      }
    } catch (err) {
      setSubMessage("Network error");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070b14] text-white flex items-center justify-center font-mono">
        <div className="animate-pulse text-cyan-400">Loading Intelligence Wire...</div>
      </div>
    );
  }

  if (!story) {
    return (
      <div className="min-h-screen bg-[#070b14] text-white flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold mb-4">Intelligence Report Not Found</h1>
        <button 
          onClick={() => router.push("/")}
          className="flex items-center gap-2 px-4 py-2 bg-cyan-500 text-slate-950 rounded-xl font-semibold hover:bg-cyan-400 transition-all"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Terminal
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 font-sans selection:bg-cyan-500 selection:text-white pb-20">
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40 px-4 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button 
            onClick={() => router.push("/")}
            className="flex items-center gap-2 text-sm text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Global Wire
          </button>
          <span className="text-xs font-mono text-slate-500 uppercase tracking-widest">NeuroWire Terminal</span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 pt-10">
        <div className="space-y-6">
          <div className="flex items-center gap-3 text-xs font-mono text-cyan-400">
            <span className="px-2.5 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded-full">{story.source}</span>
            <span>•</span>
            <span>{story.createdAt ? new Date(story.createdAt).toLocaleDateString() : "Live Feed"}</span>
          </div>

          <h1 className="text-3xl md:text-4xl font-extrabold text-white leading-tight">
            {story.title}
          </h1>

          <div className="h-72 md:h-96 w-full rounded-3xl overflow-hidden border border-slate-800 shadow-2xl">
            <img src={story.image} alt={story.title} className="w-full h-full object-cover" />
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 text-lg text-slate-300 leading-relaxed">
            <p className="font-medium text-cyan-200/90">{story.summary}</p>
          </div>

          {!isSubscribed ? (
            <div className="my-10 p-8 rounded-3xl bg-gradient-to-b from-slate-900 to-slate-950 border border-cyan-500/30 shadow-2xl relative overflow-hidden text-center space-y-6">
              <div className="absolute -top-12 -right-12 w-36 h-36 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
              
              <div className="inline-flex p-4 bg-cyan-500/10 border border-cyan-500/20 rounded-2xl text-cyan-400">
                <Lock className="h-7 w-7" />
              </div>

              <div className="space-y-2 max-w-lg mx-auto">
                <h3 className="text-2xl font-bold text-white">Unlock Full Intelligence Briefing</h3>
                <p className="text-slate-400 text-sm">
                  This report contains proprietary market breakdown, technical architecture deep-dives, and strategic foresight. Enter your email to get instant access.
                </p>
              </div>

              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <input 
                  type="email" 
                  required
                  placeholder="name@company.com" 
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors"
                />
                <button 
                  type="submit" 
                  disabled={submitting}
                  className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-6 py-3 rounded-xl text-sm transition-all shadow-lg shadow-cyan-500/20 cursor-pointer"
                >
                  {submitting ? "Verifying..." : "Unlock Access"}
                </button>
              </form>

              {subMessage && (
                <p className={`text-xs font-mono mt-2 ${subMessage.includes("Access") ? "text-cyan-400" : "text-red-400"}`}>
                  {subMessage}
                </p>
              )}

              <div className="flex items-center justify-center gap-2 text-xs text-slate-500 pt-2">
                <ShieldCheck className="h-4 w-4 text-cyan-500" />
                <span>Instant access. No spam. Unsubscribe anytime.</span>
              </div>
            </div>
          ) : (
            <div className="space-y-8 animate-fadeIn">
              <div className="space-y-4 text-base text-slate-300 leading-relaxed pt-4 border-t border-slate-800">
                {story.fullReport?.map((paragraph: string, idx: number) => (
                  <p key={idx}>{paragraph}</p>
                ))}
              </div>

              <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 shadow-xl">
                <h4 className="text-xs font-mono uppercase tracking-wider text-cyan-400 mb-4 flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4" /> Key Strategic Takeaways
                </h4>
                <ul className="space-y-3">
                  {story.bullets?.map((b: string, i: number) => (
                    <li key={i} className="flex items-start gap-3 text-slate-300 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-cyan-400 shrink-0 mt-1" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
