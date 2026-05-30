import type { Metadata, Viewport } from "next";
import { Electrolize, Michroma, Space_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import "./themes.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://ratehunter.net";

const fontSans = Electrolize({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: "400",
});

const fontSerif = Michroma({
  subsets: ["latin"],
  variable: "--font-serif",
  weight: "400",
});

const fontMono = Space_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Ellis Andersen | Branch Manager, Mortgage Broker, Real Estate Agent",
  description:
    "Borrower-first mortgage and real estate guidance from Ellis Andersen at West Capital Lending, including purchase, refinance, HELOC, and application support.",
  keywords:
    "Ellis Andersen, mortgage broker, branch manager, real estate agent, West Capital Lending, RateHunter, HELOC, refinance, home purchase",
  authors: [{ name: "Ellis Andersen" }],
  openGraph: {
    title:
      "Ellis Andersen | Branch Manager, Mortgage Broker, Real Estate Agent",
    description:
      "Borrower-first mortgage and real estate guidance from Ellis Andersen at West Capital Lending.",
    url: siteUrl,
    siteName: "RateHunter",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title:
      "Ellis Andersen | Branch Manager, Mortgage Broker, Real Estate Agent",
    description:
      "Borrower-first mortgage and real estate guidance from Ellis Andersen at West Capital Lending.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#242329",
};

import { ThemeProvider } from "@/components/theme-provider";
import { DEFAULT_THEME, themes } from "@/config/themes";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
      </head>
      <body
        className={`${fontSans.variable} ${fontSerif.variable} ${fontMono.variable} min-h-screen bg-background text-foreground antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme={DEFAULT_THEME}
          enableSystem={false}
          themes={themes.map((t) => t.value) as string[]}
        >
          {children}
        </ThemeProvider>
        <Script
          async
          crossOrigin="anonymous"
          src="https://tweakcn.com/live-preview.min.js"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
