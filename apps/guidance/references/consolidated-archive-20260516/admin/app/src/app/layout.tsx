import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ClientWrapper } from '@/components/layout/ClientWrapper'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Nyra Admin - Mortgage Operations Dashboard',
  description: 'Administrative interface for Nyra mortgage operations, lead management, and compliance tracking.',
  keywords: 'mortgage, admin, dashboard, leads, compliance, operations',
  authors: [{ name: 'Nyra' }],
  robots: {
    index: false, // Admin interface should not be indexed
    follow: false,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="robots" content="noindex, nofollow" />
      </head>
      <body className={`${inter.className} antialiased`}>
        <ClientWrapper>
          {children}
        </ClientWrapper>

        {/* Background Effects */}
        <div className="pointer-events-none fixed inset-0 z-[-1]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(34,211,238,0.05),transparent_35%),radial-gradient(circle_at_80%_80%,rgba(139,92,246,0.05),transparent_35%)]" />
        </div>
      </body>
    </html>
  )
}
