import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "RateHunter - Compare Mortgage Rates & Get Pre-Approved",
  description: "Find the best mortgage rates from top lenders. Get personalized quotes in seconds. Compare rates for conventional, FHA, VA, and jumbo loans.",
  keywords: "mortgage rates, home loans, refinance, mortgage calculator, best mortgage rates",
  openGraph: {
    title: "RateHunter - Compare Mortgage Rates",
    description: "Get personalized mortgage quotes from top lenders in seconds",
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
      <body className={inter.className}>{children}</body>
    </html>
  );
}
