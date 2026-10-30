import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "NextGen AI Hub",
  description: "Futuristic AI & Crypto News Wire",
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
