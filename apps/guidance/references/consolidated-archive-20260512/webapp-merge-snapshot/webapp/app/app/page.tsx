import Link from 'next/link'

export default function HomePage() {
  return (
    <section style={{ maxWidth: 820 }}>
      <p style={{ color: '#60a5fa', letterSpacing: '0.12em', marginBottom: 8, textTransform: 'uppercase' }}>
        Internal Tools
      </p>
      <h1 style={{ fontSize: 40, lineHeight: 1.1, margin: '0 0 12px' }}>Nyra WebApp</h1>
      <p style={{ color: '#cbd5e1', marginBottom: 20 }}>
        This app now exposes an internal OpenClaw chat route backed by a server-side proxy so browser clients do not
        talk to the upstream gateway directly.
      </p>
      <Link href="/tools/openclaw" style={{ color: '#93c5fd', fontWeight: 600 }}>
        Open /tools/openclaw
      </Link>
    </section>
  )
}
