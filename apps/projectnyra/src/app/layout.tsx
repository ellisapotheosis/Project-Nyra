import type { Metadata } from "next";
import Script from "next/script";
import { Electrolize, Michroma, Space_Mono } from "next/font/google";

import "./globals.css";

import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/lib/auth-context";
import { DEFAULT_THEME, themes } from "@/config/themes";

export const metadata: Metadata = {
  title: "Project Nyra",
  description:
    "Broker-facing command center for campaigns, quotes, CRM views, and mortgage operations.",
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
          defaultTheme={DEFAULT_THEME}
          disableTransitionOnChange={false}
          enableSystem={false}
          themes={themes.map((t) => t.value) as string[]}
        >
          <AuthProvider>{children}</AuthProvider>
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
