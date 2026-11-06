'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Bell, Menu, Sparkles, X } from 'lucide-react';
import SidebarDrawer from '@/app/components/SidebarDrawer';
import NotificationPopup from '@/app/components/NotificationPopup';
import NewsTicker from '@/app/components/NewsTicker';

export default function ClientLayoutWrapper({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  return (
    <>
      {/* 1. CYBERPUNK GLOBAL HEADER */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#060814]/80 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-colors flex items-center space-x-2"
            >
              <Menu className="w-4 h-4 text-blue-400" />
              <span className="hidden sm:inline text-xs font-mono">DASHBOARD</span>
            </button>

            <Link href="/" className="flex items-center space-x-2 group">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/30">
                <span className="font-bold text-white text-lg font-mono">a</span>
              </div>
              <span className="font-extrabold text-xl tracking-wider bg-gradient-to-r from-white via-slate-200 to-blue-400 bg-clip-text text-transparent font-['Space_Grotesk']">
                NEUROWIRE<span className="text-blue-500">-NEWS</span>
              </span>
            </Link>
          </div>

          <div className="flex items-center space-x-3 relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-colors"
            >
              <Bell className="w-4 h-4 text-blue-400 animate-pulse" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-500 animate-ping"></span>
            </button>

            {showNotifications && (
              <div className="absolute right-0 top-12 w-80 sm:w-96 rounded-2xl bg-[#0b0f19] border border-white/10 shadow-2xl p-4 backdrop-blur-2xl z-50">
                <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-blue-400" />
                    <span className="font-bold text-xs font-['Space_Grotesk'] tracking-wider">LIVE INTEL ALERTS</span>
                  </div>
                  <button onClick={() => setShowNotifications(false)} className="text-slate-500 hover:text-white">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/10 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-semibold text-slate-200">Push Alerts</div>
                    <div className="text-[10px] text-slate-400 font-mono">Real-time breaking updates</div>
                  </div>
                  <button
                    onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                    className={`px-3 py-1 rounded-lg text-xs font-mono ${
                      notificationsEnabled ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-blue-600 text-white'
                    }`}
                  >
                    {notificationsEnabled ? 'Enabled ✓' : 'Turn On'}
                  </button>
                </div>
              </div>
            )}

            <Link href="/auth/signup" className="hidden sm:flex items-center space-x-2 bg-blue-600 hover:bg-blue-500 px-3.5 py-1.5 rounded-lg text-xs font-mono text-white transition-colors shadow-lg shadow-blue-500/20">
              <span>Sign Up</span>
            </Link>
          </div>
        </div>
      </header>

      {/* 2. SIDEBAR DRAWER */}
      <SidebarDrawer isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* 3. MAIN PAGE CONTENT */}
      <main className="flex-1">{children}</main>

      {/* 4. NOTIFICATION POPUP */}
      <NotificationPopup />
    </>
  );
                    }
