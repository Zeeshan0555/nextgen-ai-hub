import type { Metadata } from 'next';
import { Inter, Space_Grotesk } from 'next/font/google';
import './globals.css';
import ClientLayoutWrapper from '@/app/components/ClientLayoutWrapper';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://neurowire-news.vercel.app'),
  title: 'NeuroWire News | AI, Crypto & Technology Updates',
  description: 'Follow the latest AI, crypto, policy, technology, Fox News and leadership headlines with direct links to original publishers.',
  openGraph: {
    title: 'NeuroWire News | AI, Crypto & Technology Updates',
    description: 'Six focused news sections, clear publisher attribution and source links.',
    siteName: 'NeuroWire News',
    url: 'https://neurowire-news.vercel.app',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'NeuroWire News | AI, Crypto & Technology Updates',
    description: 'Six focused news sections with direct links to original publishers.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable} dark`}>
      <body className="bg-[#060814] text-slate-100 font-sans antialiased selection:bg-blue-600 selection:text-white min-h-screen flex flex-col">
        <ClientLayoutWrapper>
          {children}
        </ClientLayoutWrapper>
      </body>
    </html>
  );
}
