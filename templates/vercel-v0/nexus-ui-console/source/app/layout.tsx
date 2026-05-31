import type { Metadata } from "next";
import { Electrolize, Michroma, Space_Mono } from "next/font/google";
import "./globals.css";

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
  title: "Nyra Nexus Control Plane",
  description: "Operator UI for Nexus Router, MCP tools, smart routing, and LiteLLM controls.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${fontSans.variable} ${fontSerif.variable} ${fontMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
