import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css"; // Agar aapke paas globals.css hai toh yeh zaroori hai

export const metadata: Metadata = {
  title: "NeuroWire | Frontier AI & Web3 Intelligence",
  description: "Real-time AI developments, autonomous tools, and crypto market wire.",
  keywords: ["AI News", "Frontier AI", "Web3", "Crypto Market", "Autonomous Tools", "NeuroWire"],
  authors: [{ name: "NeuroWire Team" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://neurowire-news.vercel.app",
    title: "NeuroWire | Frontier AI & Web3 Intelligence",
    description: "Real-time AI developments, autonomous tools, and crypto market wire.",
    siteName: "NeuroWire",
  },
  twitter: {
    card: "summary_large_image",
    title: "NeuroWire | Frontier AI & Web3 Intelligence",
    description: "Real-time AI developments, autonomous tools, and crypto market wire.",
  },
  verification: {
    google: "ToM3svxPGC6wP1wvecZBmsQ9Jb5z6srvqsIQIWJJ7AE",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Google verification meta tag */}
        <meta name="google-site-verification" content="ToM3svxPGC6wP1wvecZBmsQ9Jb5z6srvqsIQIWJJ7AE" />
      </head>
      <body className="bg-[#070b14] text-slate-100 font-sans antialiased selection:bg-cyan-500 selection:text-white">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
