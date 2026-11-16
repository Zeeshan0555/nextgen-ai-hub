'use client';

import Link from 'next/link';
import {
  X,
  Compass,
  Radio,
  Cpu,
  ShieldCheck,
  Zap,
  Layers,
  ChevronRight,
  Filter,
  Activity,
} from 'lucide-react';

interface SidebarDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeCategory?: string;
}

export default function SidebarDrawer({ isOpen, onClose, activeCategory }: SidebarDrawerProps) {
  if (!isOpen) return null;

  const categories = [
    { name: 'AI', slug: 'ai', icon: Cpu, desc: 'Artificial intelligence' },
    { name: 'Crypto', slug: 'crypto', icon: Zap, desc: 'Digital assets and blockchain' },
    { name: 'Policy', slug: 'policy', icon: ShieldCheck, desc: 'Rules, regulation and public policy' },
    { name: 'Technology', slug: 'technology', icon: Layers, desc: 'Technology and innovation' },
    { name: 'Fox News', slug: 'fox-news', icon: Radio, desc: 'Fox News coverage' },
    { name: 'Leadership', slug: 'leadership', icon: Compass, desc: 'Leadership and decision-making' },
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
              <h2 className="font-bold text-sm font-['Space_Grotesk'] tracking-wider">NEUROWIRE NEWS</h2>
              <span className="text-[10px] text-slate-400">Browse topics and stories</span>
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
          
          {/* Category navigation */}
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
                    href={`/?category=${cat.slug}#categories`}
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

                    <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                );
              })}
            </div>
          </div>

        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-white/10 bg-slate-950/60 text-center text-[11px] font-mono text-slate-500">
          NeuroWire News • Topic directory
        </div>

      </div>
    </div>
  );
      }
