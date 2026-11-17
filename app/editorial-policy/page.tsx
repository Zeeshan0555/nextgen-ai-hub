import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Editorial Policy | NeuroWire News",
  description: "NeuroWire News sourcing, attribution, categorisation, corrections and publishing standards.",
};

export default function EditorialPolicyPage() {
  return (
    <main className="min-h-screen bg-[#070b14] text-slate-100 px-5 py-10 md:px-10">
      <article className="mx-auto max-w-3xl space-y-6">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-cyan-400 hover:text-cyan-300"><ArrowLeft className="h-4 w-4" /> Back to news</Link>
        <header className="border-b border-slate-800 pb-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-cyan-400">How we publish</p>
          <h1 className="mt-2 text-3xl font-bold">Editorial Policy</h1>
        </header>
        <section className="space-y-4 text-sm leading-7 text-slate-300">
          <h2 className="text-lg font-semibold text-white">Sources and attribution</h2>
          <p>NeuroWire collects headlines and excerpts from named publisher feeds. The publisher label identifies where an item came from; it does not mean NeuroWire independently reported or verified every statement. Readers should open the original publisher report for the full context, corrections and updates.</p>
          <h2 className="text-lg font-semibold text-white">News categories</h2>
          <p>Stories are assigned to one of six sections: AI, Crypto, Policy, Technology, Fox News and Leadership. Fox News is a publisher-based section. Other sections are topic-based. Automated categorisation may be imperfect, and readers can use the original source to confirm context.</p>
          <h2 className="text-lg font-semibold text-white">Quality checks</h2>
          <p>Automated checks look for a usable headline, publisher text, publication date and a relevant topic signal. Similar headlines are checked to reduce duplicates. These checks reduce obvious errors but do not replace independent fact-checking or guarantee that every feed item is accurate.</p>
          <h2 className="text-lg font-semibold text-white">Corrections and updates</h2>
          <p>Incorrect publisher attribution, category or date should be corrected when identified. If an original publisher changes or removes a report, the linked source remains the best place to check its latest version. NeuroWire does not claim to have a staffed 24-hour fact-checking desk.</p>
          <h2 className="text-lg font-semibold text-white">What we do not do</h2>
          <p>We do not invent authors, quotes, sources, publication dates, statistics or verification labels. A publisher excerpt is not presented as a complete NeuroWire investigation. If an item does not meet basic feed checks, it should not be added just to increase article count.</p>
          <div className="border-t border-slate-800 pt-5"><Link href="/ai-disclosure" className="text-cyan-400 hover:text-cyan-300">Read our AI and automation disclosure</Link></div>
        </section>
      </article>
    </main>
  );
}
