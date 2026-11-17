import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "AI and Automation Disclosure | NeuroWire News",
  description: "How NeuroWire News uses automated headline collection, classification and Admin-reviewed AI drafts.",
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
          <h2 className="text-lg font-semibold text-white">Automated headlines</h2>
          <p>NeuroWire automatically checks selected official company and public-agency feeds. The public headline feed uses the headline, publisher name, publication date and a direct link to the original report. It does not republish the feed's full article text or images.</p>
          <h2 className="text-lg font-semibold text-white">Category assignment</h2>
          <p>When the Gemini service is configured, it may classify a headline using only the headline and publisher name. If the result is uncertain or the service is unavailable, NeuroWire keeps the section assigned by the source configuration. Fox News remains a publisher-specific section with a direct link to its official website; it is not used as a general topic label.</p>
          <h2 className="text-lg font-semibold text-white">AI-assisted editorial drafts</h2>
          <p>An Admin may provide original reporting notes or source material they have permission to use and ask Gemini to prepare a draft. The draft includes short evidence excerpts checked against the submitted material. The AI tool does not fetch full publisher articles and does not publish anything by itself.</p>
          <p>An Admin must review, correct and approve every AI-assisted draft before it is published. Evidence matching is a safeguard, not proof that every claim is true or a replacement for independent fact-checking.</p>
          <h2 className="text-lg font-semibold text-white">Search visibility</h2>
          <p>Headline-only pages are intended to help visitors find the original publisher report. They are not included in the article sitemap and are marked not to be indexed. Only substantial, reviewed NeuroWire briefings that pass the page checks may be included in the article sitemap.</p>
          <p>Automation can make mistakes. Use the original publisher link for complete context, corrections and updates. NeuroWire does not claim that an automated headline or AI draft is independent reporting.</p>
          <div className="border-t border-slate-800 pt-5"><Link href="/editorial-policy" className="text-cyan-400 hover:text-cyan-300">Read our Editorial Policy</Link></div>
        </section>
      </article>
    </main>
  );
}
