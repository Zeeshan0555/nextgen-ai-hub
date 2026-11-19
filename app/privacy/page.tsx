import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Privacy Policy | NeuroWire News",
  description: "How NeuroWire News handles information when visitors use this website.",
};

export default function PrivacyPolicy() {
  return (
    <main className="min-h-screen bg-[#070b14] text-slate-100 px-5 py-10 md:px-10">
      <article className="mx-auto max-w-3xl space-y-6">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-cyan-400 hover:text-cyan-300">
          <ArrowLeft className="h-4 w-4" /> Back to news
        </Link>
        <header className="border-b border-slate-800 pb-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-cyan-400">Your information</p>
          <h1 className="mt-2 text-3xl font-bold">Privacy Policy</h1>
          <p className="mt-2 text-xs text-slate-500">Last reviewed: 17 November 2026</p>
        </header>
        <section className="space-y-4 text-sm leading-7 text-slate-300">
          <p>This page explains the information-handling features currently visible in NeuroWire News. The site may change as new features are added; this policy must be reviewed before new data collection or advertising is enabled.</p>
          <h2 className="pt-2 text-lg font-semibold text-white">Information you enter</h2>
          <p>The current homepage subscription control stores a small preference flag in your browser's local storage. It does not currently submit the email address entered in that control to a mailing-list service. Do not enter sensitive information into website forms.</p>
          <p>Saved stories are kept in this browser on this device using local storage. They are not synced to an account or sent to NeuroWire's server by the save button. You can remove a saved story from the Saved Stories view or the article page, and clearing this browser's site data will also remove the saved list.</p>
          <h2 className="pt-2 text-lg font-semibold text-white">Sign-in and security</h2>
          <p>The Admin sign-in feature uses a server-managed, HTTP-only session cookie after a successful sign-in. The public news feed does not require visitors to create an account.</p>
          <h2 className="pt-2 text-lg font-semibold text-white">News content and service providers</h2>
          <p>Publisher stories are retrieved from third-party RSS feed services. The website also uses hosting and database services to deliver the site and store newsroom articles. Those providers may process technical information needed to operate and secure their services; consult the providers' own privacy notices for their practices.</p>
          <h2 className="pt-2 text-lg font-semibold text-white">Cookies, analytics and advertising</h2>
          <p>NeuroWire's current code includes an Admin session cookie and a browser-local preference flag. Google AdSense advertising is not currently connected in this version of the site. If advertising, analytics or additional tracking tools are enabled, this policy and any required consent controls must be updated before launch.</p>
          <h2 className="pt-2 text-lg font-semibold text-white">External links</h2>
          <p>News pages may link to original publisher websites. Those websites operate under their own privacy policies and practices.</p>
          <h2 className="pt-2 text-lg font-semibold text-white">Policy updates</h2>
          <p>This policy should be updated whenever the site's data collection, hosting, analytics, newsletter or advertising arrangements change. The date at the top indicates the latest review of this page, not a guarantee that every provider's practices are unchanged.</p>
          <div className="border-t border-slate-800 pt-5">
            <Link href="/about" className="text-cyan-400 hover:text-cyan-300">About NeuroWire News</Link>
          </div>
        </section>
      </article>
    </main>
  );
}
