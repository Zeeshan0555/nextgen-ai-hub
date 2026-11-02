import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";

export const metadata: Metadata = {
  title: "NeuroWire | Frontier AI & Web3 Intelligence",
  description: "Real-time AI developments, autonomous tools, and crypto market wire.",
  verification: {
    google: "ToM3svxPGC6wP1wvecZBmsQ9Jb5z6srvqsIQIWJJ7AE",
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
        <script src="https://cdn.tailwindcss.com"></script>
        <meta name="google-site-verification" content="ToM3svxPGC6wP1wvecZBmsQ9Jb5z6srvqsIQIWJJ7AE" />
      </head>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
