import type { Metadata } from "next";
import { Electrolize, Michroma, Space_Mono } from "next/font/google";

import "./globals.css";

import { ThemeProvider } from "@/components/theme-provider";

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
      <head>
        <script
          async
          crossOrigin="anonymous"
          src="https://tweakcn.com/live-preview.min.js"
        />
      </head>
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
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
