'use client';

import React from 'react';
import { LayoutDashboard, FileText, Cpu, Database, ShieldCheck, Settings, X, Zap } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  return (
    <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#0c0e15] border-r border-purple-900/30 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'} flex flex-col`}>
      <div className="p-6 flex items-center justify-between border-b border-slate-800/60">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-600/30">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold tracking-wider text-lg bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">NEUROWIRE</h1>
            <span className="text-[10px] text-slate-400 tracking-widest uppercase">AI Command Center</span>
          </div>
        </div>
        <button onClick={onClose} className="lg:hidden text-slate-400 hover:text-white">
          <X className="h-6 w-6" />
        </button>
      </div>

      <nav className="p-4 space-y-1.5 flex-1">
        <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-purple-600/10 text-purple-400 border border-purple-500/20 font-medium">
          <LayoutDashboard className="h-5 w-5" /> Dashboard
        </a>
        <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/40">
          <FileText className="h-5 w-5" /> CMS Articles
        </a>
        <a href="#" className="files items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/40">
          <Cpu className="h-5 w-5" /> AI Automation
        </a>
        <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/40">
          <Database className="h-5 w-5" /> Vector DB (pgvector)
        </a>
        <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/40">
          <ShieldCheck className="h-5 w-5" /> Security & RLS
        </a>
        <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/40">
          <Settings className="h-5 w-5" /> Settings
        </a>
      </nav>

      <div className="p-4 border-t border-slate-800/60 bg-[#090a0f]">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-gradient-to-r from-cyan-500 to-purple-600 flex items-center justify-center font-bold text-sm">Z</div>
          <div className="overflow-hidden">
            <p className="text-sm font-semibold truncate">Zeeshan0555</p>
            <p className="text-xs text-purple-400 flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span> System Online
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};
