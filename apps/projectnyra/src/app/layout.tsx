import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Electrolize, Michroma, Space_Mono } from "next/font/google";

import "./globals.css";

import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/lib/auth-context";
import { DEFAULT_THEME, themes } from "@/config/themes";
import { Toaster } from "@/components/ui/toaster";
import { ErrorBoundary } from "@/components/error-boundary";

export const metadata: Metadata = {
  title: "Project Nyra",
  description:
    "Broker-facing command center for campaigns, quotes, CRM views, and mortgage operations.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${fontSans.variable} ${fontSerif.variable} ${fontMono.variable} min-h-screen bg-background text-foreground antialiased`}
      >
        <ErrorBoundary>
          <ThemeProvider
            attribute="class"
            defaultTheme={DEFAULT_THEME}
            disableTransitionOnChange={false}
            enableSystem={false}
            themes={themes.map((t) => t.value) as string[]}
          >
            <AuthProvider>{children}</AuthProvider>
            <Toaster />
          </ThemeProvider>
        </ErrorBoundary>
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
