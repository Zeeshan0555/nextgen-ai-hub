import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "AI and Automation Disclosure | NeuroWire News",
  description: "How automation is currently used to collect and organise NeuroWire News stories.",
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
          <p>NeuroWire uses software automation to collect publisher RSS items, clean feed formatting, check required fields, assign a section based on the configured source, sort stories by publication date and reduce duplicate headlines.</p>
          <p>The current public feed workflow does not generate original long-form reporting or independently verify every claim with an AI model. Publisher-supplied headlines and excerpts remain attributed to their original publishers.</p>
          <p>Automated classification can make mistakes. The original publisher's report should be consulted for important claims, context and updates. We will update this disclosure if AI-generated summaries, analysis or other AI-assisted editorial features are introduced.</p>
          <p>Our goal is to use automation to make useful information easier to follow, not to mass-produce pages with little original value.</p>
          <div className="border-t border-slate-800 pt-5"><Link href="/editorial-policy" className="text-cyan-400 hover:text-cyan-300">Read our Editorial Policy</Link></div>
        </section>
      </article>
    </main>
  );
}
