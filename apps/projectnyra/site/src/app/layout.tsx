import type { Metadata, Viewport } from 'next';

import './globals.css';

export const metadata: Metadata = {
  title: 'Project Nyra - AI Mortgage Operations System',
  description:
    'Project Nyra is an AI mortgage operations system for broker command, compliant communication, quote workflows, and integration health.',
  metadataBase: new URL('https://projectnyra.com'),
  openGraph: {
    title: 'Project Nyra',
    description: 'AI mortgage operations system from lead capture to closed loan.',
    url: 'https://projectnyra.com',
    siteName: 'Project Nyra',
    type: 'website',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#09070f',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
