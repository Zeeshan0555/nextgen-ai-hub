'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  X, 
  Compass, 
  Radio, 
  Cpu, 
  ShieldCheck, 
  Zap, 
  Database, 
  Clock, 
  Layers, 
  ChevronRight,
  Filter,
  Activity
} from 'lucide-react';

interface SidebarDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeCategory?: string;
}

export default function SidebarDrawer({ isOpen, onClose, activeCategory }: SidebarDrawerProps) {
  const [timeFormat, setTimeFormat] = useState<'exact' | 'relative'>('exact');

  if (!isOpen) return null;

  const categories = [
    { name: 'Agentic AI 101', slug: 'agentic-ai-101', icon: Compass, count: 30, desc: 'Foundations & Core Logic' },
    { name: 'AI Agents', slug: 'ai-agents', icon: Cpu, count: 25, desc: 'Autonomous Platforms & LLM Frameworks' },
    { name: 'Autonomous Workflows', slug: 'autonomous-workflows', icon: Zap, count: 20, desc: 'Enterprise Business Pipelines' },
    { name: 'Use Cases', slug: 'use-cases', icon: Layers, count: 23, desc: 'Production Deployment Reports' },
    { name: 'Risk & Governance', slug: 'risk-governance', icon: ShieldCheck, count: 16, desc: 'Ethics, Compliance & Policy' },
    { name: 'Infrastructure', slug: 'infrastructure', icon: Database, count: 22, desc: 'Vector DBs, RAG & Memory' },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex">
      {/* Backdrop Backdrop Overlay with Dark Blur */}
      <div 
        className="fixed inset-0 bg-black/70 backdrop-blur-md transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      {/* Main Left Drawer Panel */}
      <div className="relative w-full max-w-sm bg-[#070b19] border-r border-white/10 text-slate-100 h-full flex flex-col z-10 shadow-2xl backdrop-blur-2xl animate-in slide-in-from-left duration-300">
        
        {/* Drawer Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between bg-slate-950/40">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Activity className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <h2 className="font-bold text-sm font-['Space_Grotesk'] tracking-wider">NEUROWIRE DASHBOARD</h2>
              <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                SYSTEM ONLINE
              </span>
            </div>
          </div>
          
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          
          {/* Section 1: System Telemetry & Database Health */}
          <div className="rounded-xl bg-white/[0.02] border border-white/10 p-4 space-y-3">
            <div className="text-[10px] font-mono text-slate-400 uppercase tracking-widest flex items-center justify-between">
              <span>TELEMETRY & STATUS</span>
              <span className="text-blue-400">SUPABASE REALTIME</span>
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="p-2 rounded bg-white/5 border border-white/5">
                <div className="text-[10px] text-slate-500">DB INSTANCE</div>
                <div className="text-emerald-400 truncate">wsuqixph...</div>
              </div>
              <div className="p-2 rounded bg-white/5 border border-white/5">
                <div className="text-[10px] text-slate-500">RLS SECURITY</div>
                <div className="text-blue-400">ENABLED ✓</div>
              </div>
            </div>
          </div>

          {/* Section 2: Category Intelligence Navigation */}
          <div>
            <div className="text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-3 flex items-center justify-between">
              <span>CATEGORIES DIRECTORY</span>
              <Filter className="w-3 h-3 text-slate-500" />
            </div>

            <div className="space-y-1.5">
              {categories.map((cat) => {
                const IconComponent = cat.icon;
                const isActive = activeCategory === cat.slug;
                
                return (
                  <Link
                    key={cat.slug}
                    href={`/category/${cat.slug}`}
                    onClick={onClose}
                    className={`group flex items-center justify-between p-3 rounded-xl border transition-all ${
                      isActive 
                        ? 'bg-blue-600/15 border-blue-500/50 text-white' 
                        : 'bg-white/[0.02] border-white/5 hover:border-white/20 hover:bg-white/[0.04] text-slate-300'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg border ${
                        isActive ? 'bg-blue-500/20 border-blue-500/40 text-blue-400' : 'bg-white/5 border-white/10 text-slate-400 group-hover:text-blue-400'
                      }`}>
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold font-['Space_Grotesk']">{cat.name}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{cat.desc}</div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 font-mono text-[10px]">
                      <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-slate-400">
                        {cat.count}
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Section 3: Time Display Preferences */}
          <div className="rounded-xl bg-white/[0.02] border border-white/10 p-4">
            <div className="flex items-center space-x-2 text-xs font-mono text-slate-300 mb-2">
              <Clock className="w-4 h-4 text-blue-400" />
              <span>TIMESTAMP FORMAT PREFERENCE</span>
            </div>
            
            <div className="grid grid-cols-2 gap-2 mt-3">
              <button
                onClick={() => setTimeFormat('exact')}
                className={`py-1.5 px-3 rounded-lg text-xs font-mono border transition-all ${
                  timeFormat === 'exact'
                    ? 'bg-blue-600 text-white border-blue-500'
                    : 'bg-white/5 border-white/10 text-slate-400 hover:text-slate-200'
                }`}
              >
                Exact (2:37 AM)
              </button>
              <button
                onClick={() => setTimeFormat('relative')}
                className={`py-1.5 px-3 rounded-lg text-xs font-mono border transition-all ${
                  timeFormat === 'relative'
                    ? 'bg-blue-600 text-white border-blue-500'
                    : 'bg-white/5 border-white/10 text-slate-400 hover:text-slate-200'
                }`}
              >
                Relative (15m ago)
              </button>
            </div>
          </div>

        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-white/10 bg-slate-950/60 text-center text-[11px] font-mono text-slate-500">
          NeuroWire Architecture v2.4 • Supabase Integrated
        </div>

      </div>
    </div>
  );
      }
