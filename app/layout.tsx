import type { Metadata } from "next";
import { Electrolize, Michroma, Space_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

const fontSans = Electrolize({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-electrolize",
});

const fontSerif = Michroma({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-michroma",
});

const fontMono = Space_Mono({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-space-mono",
});

export const metadata: Metadata = {
  title: "APOTHEOSIS MINT MIDNIGHT GLOW",
  description: "A multi-theme dark mode experience",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${fontSans.variable} ${fontSerif.variable} ${fontMono.variable} antialiased font-sans bg-background`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="midnight-mint"
          enableSystem={false}
          themes={["midnight-mint", "neon-violet", "cosmic-purple", "astral-indigo"]}
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
