import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "About NeuroWire News",
  description: "Learn about NeuroWire News, its six coverage sections, sourcing approach and editorial standards.",
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#070b14] text-slate-100 px-5 py-10 md:px-10">
      <article className="mx-auto max-w-3xl space-y-7">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-cyan-400 hover:text-cyan-300">
          <ArrowLeft className="h-4 w-4" /> Back to news
        </Link>
        <header className="border-b border-slate-800 pb-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-cyan-400">About the newsroom</p>
          <h1 className="mt-2 text-3xl font-bold">About NeuroWire News</h1>
          <p className="mt-3 text-sm leading-6 text-slate-400">A news site covering artificial intelligence, crypto, policy, technology and leadership.</p>
        </header>
        <section className="space-y-3 text-sm leading-7 text-slate-300">
          <p>NeuroWire News brings selected reports from named publishers into one place. Our aim is to help readers follow important developments without confusing one publisher's reporting with our own work.</p>
          <h2 className="pt-3 text-xl font-semibold text-white">What we cover</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>AI — artificial intelligence, research and AI products.</li>
            <li>Crypto — digital assets, blockchain and related regulation.</li>
            <li>Policy — public policy, technology laws and regulation.</li>
            <li>Technology — software, devices, cybersecurity and science.</li>
            <li>Fox News — stories published by Fox News, clearly attributed to that publisher.</li>
            <li>Leadership — company leaders, management and business strategy.</li>
          </ul>
          <h2 className="pt-3 text-xl font-semibold text-white">How stories are sourced</h2>
          <p>Stories are collected from publisher RSS feeds. Each item should show its publisher and publication date when those details are supplied by the feed. A publisher excerpt is not a NeuroWire investigation, and readers should use the original source link for the complete report.</p>
          <p>Our feed collection and category assignment are automated. Automated checks can make mistakes, so please check the original report for important decisions or claims.</p>
          <h2 className="pt-3 text-xl font-semibold text-white">Corrections</h2>
          <p>If you spot an incorrect headline, category, date or attribution, use the website's verified contact channel when one is published. We will not display an unverified email address or claim to offer a staffed newsroom contact that has not been set up.</p>
          <nav className="flex flex-wrap gap-4 border-t border-slate-800 pt-5 text-sm">
            <Link href="/editorial-policy" className="text-cyan-400 hover:text-cyan-300">Editorial policy</Link>
            <Link href="/ai-disclosure" className="text-cyan-400 hover:text-cyan-300">AI and automation</Link>
            <Link href="/privacy" className="text-cyan-400 hover:text-cyan-300">Privacy policy</Link>
          </nav>
        </section>
      </article>
    </main>
  );
}
