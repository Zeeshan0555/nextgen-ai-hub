import React from "react";
import Link from "next/link";
import { ArrowLeft, Zap, Mail, Shield, Globe } from "lucide-react";

export const metadata = {
  title: "About Us & Editorial Standards | NeuroWire News",
  description: "Learn about NeuroWire News, our independent editorial mission, and contact our tech intelligence desk.",
};

export default function AboutPage() {
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
            <Zap className="h-4 w-4" /> Independent Media Bureau
          </div>
          <h1 className="text-3xl font-extrabold text-white">About NeuroWire News</h1>
          <p className="text-xs text-slate-500 font-mono mt-1">Market & Frontier Tech Intelligence</p>
        </div>

        <div className="space-y-4 text-sm text-slate-300 leading-relaxed">
          <p>
            <strong>NeuroWire News</strong> is a cutting-edge digital intelligence publication monitoring the intersection of Artificial Intelligence, sovereign decentralized computing, and macroeconomic market dynamics.
          </p>

          <h2 className="text-lg font-bold text-white pt-2 flex items-center gap-2">
            <Globe className="h-4 w-4 text-cyan-400" /> Our Mission
          </h2>
          <p>
            As autonomous machine intelligence and decentralized cryptographic protocols reshape global finance, our mission is to deliver timely, high-fidelity dispatches. We prioritize verifiable technical breakthroughs, sovereign policy shifts, and institutional market movements over speculative noise.
          </p>

          <h2 className="text-lg font-bold text-white pt-2 flex items-center gap-2">
            <Shield className="h-4 w-4 text-cyan-400" /> Editorial Standards & Sourcing
          </h2>
          <p>
            Our wire syndicates and analyzes reports from premier global financial and technology wire services, including Reuters, Bloomberg Technology, CNBC Policy, CoinDesk, and TechCrunch. Every dispatch undergoes structured editorial review to maintain factual integrity and contextual depth.
          </p>

          <h2 className="text-lg font-bold text-white pt-2 flex items-center gap-2">
            <Mail className="h-4 w-4 text-cyan-400" /> Contact & Editorial Bureau
          </h2>
          <p>
            For press releases, editorial corrections, or institutional inquiries, reach out directly to our editorial desk:
          </p>
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1 font-mono text-xs text-cyan-300">
            <p>Editorial Desk: contact@neurowire.news</p>
            <p>Syndication & Partnerships: media@neurowire.news</p>
          </div>
        </div>
      </div>
    </div>
  );
}
