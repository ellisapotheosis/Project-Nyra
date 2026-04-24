"use client"

import { useState } from "react"
import { Bot, Send } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

type ChatMessage = {
  role: "assistant" | "user"
  content: string
}

export default function OpenClawToolsPage() {
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(false)

  async function sendMessage() {
    if (!input.trim() || loading) {
      return
    }

    const nextMessages = [...messages, { role: "user" as const, content: input.trim() }]
    setMessages(nextMessages)
    setInput("")
    setLoading(true)

    try {
      const response = await fetch("/api/internal/openclaw/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages }),
      })

      const data = (await response.json()) as { assistant?: string }
      setMessages((current) => [...current, { role: "assistant", content: data.assistant ?? "No response." }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid gap-6">
      <div>
        <p className="text-sm uppercase tracking-[0.24em] text-muted-foreground">Internal Proxy</p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight">OpenClaw Chat Route</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          This is the merged version of the original proxy test page. It posts to a local server route so the UI can
          be exercised inside the combined app scaffold.
        </p>
      </div>

      <Card className="border-border/70 bg-card/80">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="size-5 text-primary" />
            Proxy Console
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="min-h-[320px] rounded-[1.5rem] border border-border/60 bg-background/70 p-4">
            {messages.length === 0 ? (
              <p className="text-sm text-muted-foreground">No messages yet.</p>
            ) : (
              <div className="space-y-4">
                {messages.map((message, index) => (
                  <div key={`${message.role}-${index}`} className="text-sm">
                    <span className="font-semibold text-primary">{message.role}:</span> {message.content}
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="flex gap-3">
            <Input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask OpenClaw..."
            />
            <Button type="button" onClick={() => void sendMessage()} disabled={loading || !input.trim()}>
              <Send className="size-4" />
              {loading ? "Sending..." : "Send"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
