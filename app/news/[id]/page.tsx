"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { CheckCircle2, ArrowLeft, Lock, ShieldCheck, Bell, User, Key, Mail } from "lucide-react";

export default function ArticlePage() {
  const params = useParams();
  const rawId = params?.id;
  const decodedTitle = rawId ? decodeURIComponent(Array.isArray(rawId) ? rawId[0] : rawId) : "";
  const router = useRouter();

  const [story, setStory] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Auth & Subscription Gate states (Email + Password)
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoginMode, setIsLoginMode] = useState(false); // Toggle between Sign Up & Login
  const [emailInput, setEmailInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [subMessage, setSubMessage] = useState("");

  // Notification Bell State
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [showNotificationPopup, setShowNotificationPopup] = useState(false);

  // Modern Time Format function
  const formatModernTimestamp = (isoString: string) => {
    if (!isoString) return "Live Intelligence Feed";
    const date = new Date(isoString);
    const timeStr = date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();

    if (isToday) {
      return `${timeStr} Today`;
    } else {
      const dateStr = date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
      return `${timeStr} • ${dateStr}`;
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const sub = localStorage.getItem("neurowire_sub");
      if (sub) setIsSubscribed(true);

      const notif = localStorage.getItem("neurowire_notif");
      if (notif === "true") setNotificationsEnabled(true);

      // Show notification permission banner after 10 seconds if not set
      if (!notif) {
        const timer = setTimeout(() => {
          setShowNotificationPopup(true);
        }, 10000);
        return () => clearTimeout(timer);
      }
    }
  }, []);

  const handleNotificationAction = (allow: boolean) => {
    if (allow) {
      localStorage.setItem("neurowire_notif", "true");
      setNotificationsEnabled(true);
      setSubMessage("Notifications Enabled!");
    } else {
      localStorage.setItem("neurowire_notif", "false");
    }
    setShowNotificationPopup(false);
  };

  useEffect(() => {
    async function fetchStory() {
      try {
        const res = await fetch("/api/news");
        const data = await res.json();
        
        const INITIAL_NEWS = [
          {
            title: "Global AI Chip Demand Sparks Massive Semiconductor Surge",
            source: "NeuroWire Global Wire",
            publishedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
            image: "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=800&auto=format&fit=crop",
            summary: "Major foundries report unprecedented allocation requests for 3nm nodes as sovereign AI initiatives accelerate worldwide.",
            fullReport: [
              "The global race for specialized artificial intelligence silicon has reached a critical inflection point, with major semiconductor foundries reporting fully booked advanced packaging lines through late 2026.",
              "Sovereign AI infrastructure projects across the Middle East, Europe, and Asia are driving a structural shift in demand away from consumer electronics toward enterprise-grade neural clusters."
            ],
            bullets: [
              "3nm advanced packaging lines booked out for 18 months.",
              "Sovereign AI initiatives represent 40% of current enterprise orders."
            ]
          },
          {
            title: "Autonomous Agent Swarms Redefine Enterprise Workflow Automation",
            source: "Autonomous Systems Lab",
            publishedAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
            image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop",
            summary: "Multi-agent frameworks are moving from experimental sandboxes to core enterprise operations, executing complex, multi-day objectives autonomously.",
            fullReport: [
              "Enterprise software architectures are undergoing a paradigm shift from deterministic application logic to probabilistic, multi-agent orchestration layers.",
              "Recent deployments in financial services and logistics demonstrate autonomous swarms reducing multi-day audit workflows into hours."
            ],
            bullets: [
              "Transition from deterministic software to probabilistic agent swarms.",
              "90% reduction in cycle time for complex audit compliance tasks."
            ]
          }
        ];

        let allStories = [...INITIAL_NEWS];
        if (data && data.news && data.news.length > 0) {
          const formatted = data.news.map((item: any) => ({
            title: item.title,
            source: item.source || "NeuroWire Live Feed",
            publishedAt: item.created_at || new Date().toISOString(),
            image: item.image_url || INITIAL_NEWS[0].image,
            summary: item.description || "Live intelligence wire update.",
            fullReport: [
              item.content || item.description || "Detailed analysis currently streaming from autonomous nodes.",
              "Continuous automated monitoring indicates heightened activity across this sector."
            ],
            bullets: [
              "Autonomous live intelligence feed update.",
              "Cross-verified via decentralized node telemetry."
            ]
          }));
          allStories = [...formatted, ...INITIAL_NEWS];
        }

        const found = allStories.find((s) => s.title.toLowerCase() === decodedTitle.toLowerCase()) || null;
        setStory(found);
      } catch (err) {
        console.error("Failed to fetch story", err);
      } finally {
        setLoading(false);
      }
    }

    if (decodedTitle) {
      fetchStory();
    }
  }, [decodedTitle]);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput || !passwordInput) {
      setSubMessage("Please enter email and password.");
      return;
    }
    setSubmitting(true);
    setSubMessage("");

    try {
      // Call api/subscribe or custom auth route to register/login with email & password
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailInput, password: passwordInput }),
      });
      const data = await res.json();
      
      if (data.success) {
        localStorage.setItem("neurowire_sub", "true");
        setIsSubscribed(true);
        setSubMessage(isLoginMode ? "Login Successful!" : "Account Created & Access Granted!");
      } else {
        setSubMessage(data.error || "Authentication failed.");
      }
    } catch (err) {
      setSubMessage("Network error occurred.");
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
          className="flex items-center gap-2 px-4 py-2 bg-cyan-500 text-slate-950 rounded-xl font-semibold hover:bg-cyan-400 transition-all cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Terminal
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 font-sans selection:bg-cyan-500 selection:text-white pb-20 relative">
      {/* Top Header with Bell Notification Icon */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40 px-4 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button 
            onClick={() => router.push("/")}
            className="flex items-center gap-2 text-sm text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Global Wire
          </button>
          
          <div className="flex items-center gap-4">
            {/* Bell Notification Toggle */}
            <button 
              onClick={() => {
                const newState = !notificationsEnabled;
                setNotificationsEnabled(newState);
                localStorage.setItem("neurowire_notif", String(newState));
              }}
              className={`p-2 rounded-full border transition-all cursor-pointer ${
                notificationsEnabled ? "bg-cyan-500/20 border-cyan-500 text-cyan-400" : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
              }`}
              title={notificationsEnabled ? "Notifications Active" : "Enable Notifications"}
            >
              <Bell className="h-4 w-4" />
            </button>
            <span className="text-xs font-mono text-slate-500 uppercase tracking-widest hidden sm:inline">NeuroWire Terminal</span>
          </div>
        </div>
      </header>

      {/* Main Article Container */}
      <main className="max-w-3xl mx-auto px-4 pt-10">
        <div className="space-y-6">
          <div className="flex items-center justify-between text-xs font-mono text-cyan-400">
            <span className="px-2.5 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded-full">{story.source}</span>
            <span className="text-slate-400">{formatModernTimestamp(story.publishedAt)}</span>
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

          {/* 🔒 EMAIL + PASSWORD AUTH & SUBSCRIPTION GATE */}
          {!isSubscribed ? (
            <div className="my-10 p-8 rounded-3xl bg-gradient-to-b from-slate-900 to-slate-950 border border-cyan-500/30 shadow-2xl relative overflow-hidden text-center space-y-6">
              <div className="absolute -top-12 -right-12 w-36 h-36 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
              
              <div className="inline-flex p-4 bg-cyan-500/10 border border-cyan-500/20 rounded-2xl text-cyan-400">
                <Lock className="h-7 w-7" />
              </div>

              <div className="space-y-2 max-w-lg mx-auto">
                <h3 className="text-2xl font-bold text-white">
                  {isLoginMode ? "Log In to Access Briefing" : "Create Account & Unlock Briefing"}
                </h3>
                <p className="text-slate-400 text-sm">
                  {isLoginMode ? "Enter your credentials to access your intelligence session." : "Enter your email and create a password to unlock full proprietary analysis."}
                </p>
              </div>

              <form onSubmit={handleAuthSubmit} className="max-w-md mx-auto space-y-3">
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
                  <input 
                    type="email" 
                    required
                    placeholder="name@company.com" 
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors"
                  />
                </div>

                <div className="relative">
                  <Key className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
                  <input 
                    type="password" 
                    required
                    placeholder="Create or enter password" 
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors"
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={submitting}
                  className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold py-3 rounded-xl text-sm transition-all shadow-lg shadow-cyan-500/20 cursor-pointer"
                >
                  {submitting ? "Processing..." : isLoginMode ? "Log In & Unlock" : "Create Account & Unlock"}
                </button>
              </form>

              <div className="text-xs text-slate-400">
                {isLoginMode ? "Don't have an account? " : "Already have an account? "}
                <button 
                  type="button" 
                  onClick={() => setIsLoginMode(!isLoginMode)}
                  className="text-cyan-400 hover:underline font-semibold cursor-pointer"
                >
                  {isLoginMode ? "Sign Up" : "Log In"}
                </button>
              </div>

              {subMessage && (
                <p className={`text-xs font-mono mt-2 ${subMessage.includes("Successful") || subMessage.includes("Granted") ? "text-cyan-400" : "text-red-400"}`}>
                  {subMessage}
                </p>
              )}
            </div>
          ) : (
            /* ✅ FULL UNLOCKED CONTENT */
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

      {/* 10-Second Notification Permission Popup Banner */}
      {showNotificationPopup && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm bg-slate-900 border border-cyan-500/40 rounded-2xl p-4 shadow-2xl backdrop-blur-md animate-bounce-subtle">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-cyan-500/10 text-cyan-400 rounded-xl mt-1">
              <Bell className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-white">Enable Breaking Live Alerts?</h4>
              <p className="text-xs text-slate-400">Get notified instantly when new AI or crypto intelligence wires drop.</p>
              <div className="flex items-center gap-2 pt-2">
                <button 
                  onClick={() => handleNotificationAction(true)}
                  className="px-3 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-lg text-xs font-bold transition-all cursor-pointer"
                >
                  Allow
                </button>
                <button 
                  onClick={() => handleNotificationAction(false)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs transition-all cursor-pointer"
                >
                  Skip
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
    }
