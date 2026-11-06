import type { Metadata } from 'next';
import { Inter, Space_Grotesk } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import './globals.css';

// Professional High-End Typography Loading
const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-space' });

export const metadata: Metadata = {
  title: 'NeuroWire - The #1 Hub for Agentic AI Intelligence',
  description: 'Real-time news, deep analysis, and actionable insights on autonomous agents, multi-agent systems, and the future of work.',
  keywords: ['Agentic AI', 'Autonomous Agents', 'AI News', 'Machine Learning', 'Next.js Supabase Platform'],
  verification: {
    google: "ToM3svxPGC6wP1wvecZ0MsQ9Jb5z6srvqsIQIWJJ7AE",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body className={`${inter.variable} ${spaceGrotesk.variable} font-sans bg-[#060814] text-slate-100 antialiased selection:bg-blue-500 selection:text-white min-h-screen flex flex-col`}>
        {/* Global Ambient Glow Background Effect */}
        <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden">
          <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[140px]" />
          <div className="absolute bottom-[10%] right-[10%] w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[160px]" />
        </div>

        {/* Main Application Shell */}
        <div className="flex flex-col min-h-screen relative">
          {children}
        </div>

        {/* Vercel Analytics Integration */}
        <Analytics />
      </body>
    </html>
  );
}
