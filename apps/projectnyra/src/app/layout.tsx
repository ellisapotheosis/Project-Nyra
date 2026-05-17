import type { Metadata } from "next";

import "./globals.css";

import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "Nyra RateHunter Portal",
  description:
    "Broker-facing workspace for campaigns, quotes, CRM views, and mortgage operations.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-background text-foreground antialiased">
        <SiteHeader />
        <main className="mx-auto max-w-7xl px-5 py-8 lg:px-8">{children}</main>
      </body>
    </html>
  );
}
