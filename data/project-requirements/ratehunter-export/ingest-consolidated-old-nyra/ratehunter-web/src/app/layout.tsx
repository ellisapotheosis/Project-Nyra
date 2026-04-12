import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'RateHunter.net - Find Your Best Mortgage Rates',
  description: 'Compare mortgage rates from top lenders. Get pre-qualified in minutes with AI-powered mortgage matching.',
  keywords: 'mortgage rates, home loans, refinance, mortgage calculator, best mortgage rates',
  openGraph: {
    title: 'RateHunter.net - Find Your Best Mortgage Rates',
    description: 'Compare mortgage rates from top lenders instantly',
    url: 'https://ratehunter.net',
    siteName: 'RateHunter.net',
    locale: 'en_US',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
