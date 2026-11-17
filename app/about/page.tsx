import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "About NeuroWire News",
  description: "Learn about NeuroWire News, its six coverage sections, sources and editorial standards.",
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
          <p className="mt-3 text-sm leading-6 text-slate-400">A newsroom-style guide to AI, crypto, policy, technology, Fox News and leadership.</p>
        </header>
        <section className="space-y-3 text-sm leading-7 text-slate-300">
          <p>NeuroWire News helps readers follow selected developments from official companies and public agencies. Headlines link directly to the original publisher so readers can check the full report and its latest updates.</p>
          <h2 className="pt-3 text-xl font-semibold text-white">What we cover</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>AI — artificial intelligence, research and AI products.</li>
            <li>Crypto — digital assets, blockchain and related public-agency updates.</li>
            <li>Policy — competition, privacy, technology rules and government decisions.</li>
            <li>Technology — software, devices, cybersecurity, space and science.</li>
            <li>Fox News — a publisher-specific section linking to Fox News directly.</li>
            <li>Leadership — company leaders, management and business decisions.</li>
          </ul>
          <h2 className="pt-3 text-xl font-semibold text-white">How the newsroom works</h2>
          <p>Automatic headline collection uses selected official feeds. The headline list shows the title, publisher, publication date and a direct source link. It does not copy full feed articles or publisher images into the automated news cards.</p>
          <p>AI may help sort headlines into sections. Admin-only AI drafting is separate: an editor provides original notes or material they have permission to use, reviews the resulting draft, and decides whether to publish it. AI output is not an independent investigation or a human fact-check.</p>
          <h2 className="pt-3 text-xl font-semibold text-white">Corrections</h2>
          <p>Automated classification and date checks can make mistakes. For complete reporting, corrections and context, use the original publisher link. NeuroWire does not claim to have a staffed 24-hour newsroom or an unverified contact email.</p>
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
