'use client';

import { useState, useEffect } from 'react';
import { Radio, Zap } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

// Supabase client initialization
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface TickerItem {
  id: string;
  title: string;
  category: string;
  url?: string;
}

export default function NewsTicker() {
  const [items, setItems] = useState<TickerItem[]>([]);

  useEffect(() => {
    // 1. Initial Data Fetching
    const fetchInitialTicker = async () => {
      const { data, error } = await supabase
        .from('ticker_feeds')
        .select('id, title, category, url')
        .order('created_at', { ascending: false })
        .limit(10);

      if (!error && data) {
        setItems(data);
      }
    };

    fetchInitialTicker();

    // 2. Supabase Realtime Subscription Listener
    const channel = supabase
      .channel('public:ticker_feeds')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'ticker_feeds' },
        (payload) => {
          const newItem = payload.new as TickerItem;
          setItems((prev) => [newItem, ...prev.slice(0, 9)]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (items.length === 0) return null;

  return (
    <div className="bg-[#050711] border-b border-blue-500/20 py-2.5 px-4 overflow-hidden flex items-center shadow-inner relative z-40">
      {/* Ticker Fixed Label */}
      <div className="flex items-center space-x-2 bg-blue-600/15 border border-blue-500/30 text-blue-400 px-3 py-1 rounded-lg text-xs font-mono font-bold tracking-wider shrink-0 z-10 backdrop-blur-md">
        <Radio className="w-3.5 h-3.5 animate-pulse text-emerald-400" />
        <span>LIVE TICKER</span>
      </div>

      {/* CSS Continuous Marquee Track */}
      <div className="flex-1 overflow-hidden ml-4 relative">
        <div className="flex items-center space-x-8 animate-marquee whitespace-nowrap">
          {items.map((item) => (
            <div key={item.id} className="inline-flex items-center space-x-2 text-xs font-mono">
              <span className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-slate-400 text-[10px]">
                {item.category}
              </span>
              <span className="text-slate-200 hover:text-blue-400 transition-colors cursor-pointer flex items-center gap-1">
                <Zap className="w-3 h-3 text-blue-500 inline" />
                {item.title}
              </span>
              <span className="text-slate-600 font-bold ml-4">///</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
