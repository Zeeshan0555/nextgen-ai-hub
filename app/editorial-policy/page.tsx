import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Editorial Policy | NeuroWire News",
  description: "NeuroWire News rules for primary sources, headline attribution, category assignment and reviewed original briefings.",
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
          <h2 className="text-lg font-semibold text-white">Primary sources and attribution</h2>
          <p>Automated headline collection is limited to selected official company and public-agency feeds. NeuroWire displays the headline, source name, publication date and a direct link to the original publisher. It does not copy the full feed article or publisher image into the automated headline list.</p>
          <p>A source label tells readers where the headline came from. It does not mean NeuroWire independently reported, endorsed or verified every statement in the original report.</p>
          <h2 className="text-lg font-semibold text-white">Six news sections</h2>
          <p>NeuroWire has six sections: AI, Crypto, Policy, Technology, Fox News and Leadership. The first five automated sections use their configured official sources. Fox News is a publisher-specific section that links to Fox News directly; it is not a general world-news category.</p>
          <h2 className="text-lg font-semibold text-white">AI and human review</h2>
          <p>Gemini may help classify a headline using its title and publisher name only. Uncertain classifications fall back to the configured source category. AI-assisted article drafts are available to the signed-in Admin only and are based on original notes or material the editor has permission to use. An Admin must review and approve every draft before publication.</p>
          <h2 className="text-lg font-semibold text-white">Quality, corrections and search</h2>
          <p>Automated checks remove unusable dates, unsafe source links and obvious duplicate headlines. These checks reduce common errors but cannot guarantee accuracy. Headline-only pages link readers to the original report and are excluded from the article sitemap. Only substantial, reviewed NeuroWire briefings may be included for search indexing.</p>
          <p>We do not invent authors, quotes, facts, statistics, publication dates or verification labels. AI evidence matching is not the same as independent fact-checking. If you find an error in NeuroWire's own briefing, it should be corrected when identified.</p>
          <div className="border-t border-slate-800 pt-5"><Link href="/ai-disclosure" className="text-cyan-400 hover:text-cyan-300">Read our AI and Automation Disclosure</Link></div>
        </section>
      </article>
    </main>
  );
}
