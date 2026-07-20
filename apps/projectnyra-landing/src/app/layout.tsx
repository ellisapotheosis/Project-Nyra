import type { Metadata } from "next";
import "./globals.css";
import { NyraEffects } from "../components/NyraEffects";

export const metadata: Metadata = {
  title: "Project Nyra — AI-Powered Mortgage Operations",
  description:
    "Project Nyra is an AI-native mortgage operations platform. Intelligent lead routing, automated compliance, and real-time pipeline intelligence.",
  openGraph: {
    title: "Project Nyra",
    description: "AI-native mortgage operations platform.",
    url: "https://projectnyra.com",
    siteName: "Project Nyra",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <NyraEffects />
        {children}
      </body>
    </html>
  );
}
