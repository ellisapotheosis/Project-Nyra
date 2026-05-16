'use client'

import { useState } from 'react'

type ChatMessage = {
  role: 'assistant' | 'user'
  content: string
}

export default function OpenClawToolsPage() {
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function sendMessage() {
    const trimmedInput = input.trim()
    if (!trimmedInput || loading) {
      return
    }

    const nextMessages = [...messages, { content: trimmedInput, role: 'user' as const }]
    setMessages(nextMessages)
    setInput('')
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/internal/openclaw/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: nextMessages }),
      })
      const data = (await response.json()) as { assistant?: string; error?: string }

      if (!response.ok) {
        throw new Error(data.error || 'OpenClaw proxy request failed')
      }

      setMessages((previous) => [
        ...previous,
        { content: data.assistant || 'No assistant response body returned.', role: 'assistant' },
      ])
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section style={{ display: 'grid', gap: 16, maxWidth: 960 }}>
      <div>
        <p style={{ color: '#60a5fa', letterSpacing: '0.12em', marginBottom: 6, textTransform: 'uppercase' }}>
          Internal Proxy
        </p>
        <h1 style={{ margin: 0 }}>/tools/openclaw</h1>
        <p style={{ color: '#cbd5e1', marginTop: 8 }}>
          Thin internal chat panel using the server-side proxy route at <code>/api/internal/openclaw/chat</code>.
        </p>
      </div>

      <div
        style={{
          background: 'rgba(15, 23, 42, 0.72)',
          border: '1px solid rgba(148, 163, 184, 0.18)',
          borderRadius: 12,
          minHeight: 320,
          padding: 16,
        }}
      >
        {messages.length === 0 ? (
          <p style={{ color: '#94a3b8', margin: 0 }}>No messages yet.</p>
        ) : (
          messages.map((message, index) => (
            <div key={`${message.role}-${index}`} style={{ marginBottom: 12 }}>
              <strong style={{ color: message.role === 'assistant' ? '#34d399' : '#93c5fd' }}>{message.role}:</strong>{' '}
              <span>{message.content}</span>
            </div>
          ))
        )}
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Ask OpenClaw..."
          style={{
            background: 'rgba(15, 23, 42, 0.72)',
            border: '1px solid rgba(148, 163, 184, 0.24)',
            borderRadius: 10,
            color: '#e5edf8',
            flex: 1,
            padding: '12px 14px',
          }}
        />
        <button
          type="button"
          onClick={sendMessage}
          disabled={loading || !input.trim()}
          style={{
            background: loading ? '#334155' : '#2563eb',
            border: '1px solid #2563eb',
            borderRadius: 10,
            color: '#fff',
            cursor: loading ? 'progress' : 'pointer',
            padding: '12px 16px',
          }}
        >
          {loading ? 'Sending...' : 'Send'}
        </button>
      </div>

      {error ? <p style={{ color: '#f87171', margin: 0 }}>Error: {error}</p> : null}
    </section>
  )
}
