import type { Metadata, Viewport } from 'next';
import './globals.css';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://ratehunter.net';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: 'Ellis Andersen | Branch Manager, Mortgage Broker, Real Estate Agent',
  description:
    'Borrower-first mortgage and real estate guidance from Ellis Andersen at West Capital Lending, including purchase, refinance, HELOC, and application support.',
  keywords:
    'Ellis Andersen, mortgage broker, branch manager, real estate agent, West Capital Lending, RateHunter, HELOC, refinance, home purchase',
  authors: [{ name: 'Ellis Andersen' }],
  openGraph: {
    title: 'Ellis Andersen | Branch Manager, Mortgage Broker, Real Estate Agent',
    description:
      'Borrower-first mortgage and real estate guidance from Ellis Andersen at West Capital Lending.',
    url: siteUrl,
    siteName: 'RateHunter',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ellis Andersen | Branch Manager, Mortgage Broker, Real Estate Agent',
    description:
      'Borrower-first mortgage and real estate guidance from Ellis Andersen at West Capital Lending.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#242329',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body>{children}</body>
    </html>
  );
}
