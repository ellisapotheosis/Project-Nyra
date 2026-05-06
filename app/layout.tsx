import type { Metadata, Viewport } from "next";
import { Electrolize, Michroma, Space_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { IntegrationShell } from "@/components/shell";
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
  title: "NYRA | Universal Integration Shell 2142",
  description: "Project Nyra - AAA Sci-Fi Operating System Interface",
};

export const viewport: Viewport = {
  themeColor: "#000000",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <body
        className={`${fontSans.variable} ${fontSerif.variable} ${fontMono.variable} antialiased font-sans bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="midnight-mint"
          enableSystem={false}
          themes={["midnight-mint", "neon-violet", "cosmic-purple", "astral-indigo"]}
          disableTransitionOnChange={false}
        >
          <IntegrationShell>{children}</IntegrationShell>
        </ThemeProvider>
      </body>
    </html>
  );
}
