import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Nyra WebApp',
  description: 'Nyra admin webapp with OpenClaw internal tools integration',
}

const shellStyle = {
  background:
    'radial-gradient(circle at top, rgba(37,99,235,0.18), transparent 42%), linear-gradient(180deg, #09111f 0%, #050913 100%)',
  color: '#e5edf8',
  minHeight: '100vh',
} as const

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body style={shellStyle}>
        <header
          style={{
            alignItems: 'center',
            borderBottom: '1px solid rgba(148, 163, 184, 0.18)',
            display: 'flex',
            gap: 20,
            justifyContent: 'space-between',
            padding: '16px 24px',
          }}
        >
          <div>
            <div style={{ fontSize: 12, letterSpacing: '0.14em', opacity: 0.7, textTransform: 'uppercase' }}>
              Project Nyra
            </div>
            <strong style={{ fontSize: 20 }}>WebApp Control Surface</strong>
          </div>
          <nav style={{ display: 'flex', gap: 14 }}>
            <Link href="/" style={{ color: '#93c5fd' }}>
              Home
            </Link>
            <Link href="/tools/openclaw" style={{ color: '#93c5fd' }}>
              /tools/openclaw
            </Link>
          </nav>
        </header>
        <main style={{ padding: 24 }}>{children}</main>
      </body>
    </html>
  )
}
