import type { Metadata, Viewport } from 'next';
import './globals.css';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://project-nyra.pages.dev';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: 'RateHunter | Mortgage, Real Estate, and Borrower Guidance',
  description:
    'Borrower-first landing page for mortgage strategy, purchase guidance, refinance planning, and an OpenClaw-powered borrower chat experience.',
  keywords:
    'mortgage broker, real estate broker, refinance, home purchase, borrower chat, mortgage guidance',
  authors: [{ name: 'RateHunter Advisory' }],
  openGraph: {
    title: 'RateHunter | Mortgage, Real Estate, and Borrower Guidance',
    description:
      'Mortgage planning, home search guidance, and borrower support designed for a modern branch-led advisory experience.',
    url: siteUrl,
    siteName: 'RateHunter Advisory',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'RateHunter | Mortgage, Real Estate, and Borrower Guidance',
    description:
      'Mortgage planning, home search guidance, and borrower support designed for a modern branch-led advisory experience.',
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

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
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
        <meta name="theme-color" content="#0d2d4c" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
