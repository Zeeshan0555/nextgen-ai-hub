import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "AI and Automation Disclosure | NeuroWire News",
  description: "How NeuroWire News uses automation and evidence-checked AI-assisted briefings.",
};

export default function AiDisclosurePage() {
  return (
    <main className="min-h-screen bg-[#070b14] text-slate-100 px-5 py-10 md:px-10">
      <article className="mx-auto max-w-3xl space-y-6">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-cyan-400 hover:text-cyan-300"><ArrowLeft className="h-4 w-4" /> Back to news</Link>
        <header className="border-b border-slate-800 pb-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-cyan-400">Transparency</p>
          <h1 className="mt-2 text-3xl font-bold">AI and Automation Disclosure</h1>
        </header>
        <section className="space-y-4 text-sm leading-7 text-slate-300">
          <p>NeuroWire uses automation to collect publisher RSS items, clean feed formatting, check headlines and dates, assign categories, sort stories and reduce duplicate headlines.</p>
          <p>When the Gemini API key is configured and a publisher feed contains enough source detail, the publishing workflow can create an AI-assisted editorial briefing. The briefing is based only on the publisher text supplied to the system and includes short evidence excerpts that are checked against that text before the briefing is stored.</p>
          <p>The system does not claim that an AI briefing is an independent investigation or a human fact-check. Important claims should be checked against the original publisher report. AI output that fails the evidence checks is not used as a NeuroWire briefing.</p>
          <p>When there is not enough source material or the AI service is unavailable, NeuroWire keeps a clearly labelled publisher excerpt on the news feed. Those excerpt-only article pages are not included in the article sitemap and are marked not to be indexed by search engines.</p>
          <p>Our goal is to use automation to help readers understand sourced developments, not to mass-produce pages or inflate article counts. Automation can still make mistakes; please use the publisher link for full context and updates.</p>
          <div className="border-t border-slate-800 pt-5"><Link href="/editorial-policy" className="text-cyan-400 hover:text-cyan-300">Read our Editorial Policy</Link></div>
        </section>
      </article>
    </main>
  );
}
