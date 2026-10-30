import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "NeuroWire | Frontier AI & Web3 Intelligence",
  description: "Real-time AI developments, autonomous tools, and crypto market wire.",
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
      </head>
      <body>{children}</body>
    </html>
  );
}
