import type { Metadata } from "next";
import { Electrolize, Michroma, Space_Mono } from "next/font/google";

import "./globals.css";

import { SiteHeader } from "@/components/site-header";
import { ThemeProvider } from "@/components/theme-provider";

export const metadata: Metadata = {
  title: "Nyra RateHunter Portal",
  description:
    "Broker-facing workspace for campaigns, quotes, CRM views, and mortgage operations.",
};

const electrolize = Electrolize({
  subsets: ["latin"],
  variable: "--font-electrolize",
  weight: "400",
});

const michroma = Michroma({
  subsets: ["latin"],
  variable: "--font-michroma",
  weight: "400",
});

const spaceMono = Space_Mono({
  subsets: ["latin"],
  variable: "--font-space-mono",
  weight: ["400", "700"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${electrolize.variable} ${michroma.variable} ${spaceMono.variable} min-h-screen bg-background text-foreground antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="mint-midnight"
          disableTransitionOnChange={false}
          enableSystem={false}
          themes={[
            "mint-midnight",
            "mint-midnight-glow",
            "apotheosis",
            "virtus",
          ]}
        >
          <SiteHeader />
          <main className="mx-auto max-w-7xl px-5 py-8 lg:px-8">
            {children}
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
