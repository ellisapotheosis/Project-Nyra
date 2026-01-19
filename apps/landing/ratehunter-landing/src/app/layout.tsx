import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'RateHunter - Find the Best Mortgage Rates',
  description: 'Compare mortgage rates from top lenders and save thousands on your home loan. Get personalized quotes in minutes with RateHunter.',
  keywords: 'mortgage rates, home loans, refinance, mortgage calculator, best rates',
  authors: [{ name: 'RateHunter' }],
  openGraph: {
    title: 'RateHunter - Find the Best Mortgage Rates',
    description: 'Compare mortgage rates from top lenders and save thousands on your home loan.',
    url: 'https://ratehunter.com',
    siteName: 'RateHunter',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'RateHunter - Find the Best Mortgage Rates',
    description: 'Compare mortgage rates from top lenders and save thousands on your home loan.',
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
