import React from "react";
import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";

export const metadata = {
  title: "Privacy Policy | NeuroWire News",
  description: "Official privacy policy and data protection disclosure for NeuroWire News.",
};

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 font-sans p-6 md:p-12">
      <div className="max-w-4xl mx-auto space-y-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Live Wire
        </Link>

        <div className="border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono uppercase mb-1">
            <ShieldCheck className="h-4 w-4" /> Regulatory Compliance
          </div>
          <h1 className="text-3xl font-extrabold text-white">Privacy Policy</h1>
          <p className="text-xs text-slate-500 font-mono mt-1">Last Updated: 2026</p>
        </div>

        <div className="space-y-4 text-sm text-slate-300 leading-relaxed">
          <p>
            At <strong>NeuroWire News</strong> (accessible from neurowire-news.vercel.app), the privacy of our visitors is of supreme importance to us. This Privacy Policy document outlines the types of personal information received, collected, and how it is utilized.
          </p>

          <h2 className="text-lg font-bold text-white pt-2">1. Log Files and Web Analytics</h2>
          <p>
            Like many standard media websites, NeuroWire News makes use of log files. The information inside the log files includes internet protocol (IP) addresses, type of browser, Internet Service Provider (ISP), date/time stamp, referring/exit pages, and number of clicks to analyze trends, administer the site, and track user movement around the site.
          </p>

          <h2 className="text-lg font-bold text-white pt-2">2. Cookies and Web Beacons</h2>
          <p>
            NeuroWire News uses cookies to store information about visitors preferences, record user-specific information on which pages the user access or visit, customize Web page content based on visitors browser type or other information that the visitor sends via their browser.
          </p>

          <h2 className="text-lg font-bold text-white pt-2">3. Google DoubleClick DART Cookie & AdSense</h2>
          <p>
            Google, as a third-party vendor, uses cookies to serve ads on NeuroWire News. Googles use of the DART cookie enables it to serve ads to users based on their visit to our site and other sites on the Internet. Users may opt out of the use of the DART cookie by visiting the Google ad and content network privacy policy.
          </p>

          <h2 className="text-lg font-bold text-white pt-2">4. Editorial & Content Syndication</h2>
          <p>
            NeuroWire News operates as an independent market intelligence publication syndicating verified developments across Artificial Intelligence, decentralized systems, and financial market infrastructure.
          </p>

          <h2 className="text-lg font-bold text-white pt-2">5. Consent</h2>
          <p>
            By using our website, you hereby consent to our Privacy Policy and agree to its Terms and Conditions.
          </p>
        </div>
      </div>
    </div>
  );
}
