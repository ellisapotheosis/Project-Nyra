"use client"

import { useEffect, useMemo, useState } from "react"
import { Bot, CheckCircle2, Clock, FileText, History, Mail, MessageSquare, Pause, Play, Search, Send, Shield, User } from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

type Lead = {
  id: string
  firstName: string
  lastName: string
  campaignStatus: string
  loanPurpose: string
  loanAmount: number
}

type TimelineEvent = {
  id: string
  type: string
  channel: string
  direction: string
  description: string
  sentAt: string
}

type Message = {
  id: string
  role: "assistant" | "user"
  content: string
  model?: string
}

const quickActions = [
  "Generate a quote summary for this lead.",
  "Summarize recent communication history.",
  "Check applicable mortgage guidelines for this scenario.",
]

export default function AssistantPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null)
  const [timeline, setTimeline] = useState<TimelineEvent[]>([])
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "seed",
      role: "assistant",
      content: "Hello. I’m Nyra. Select a lead, then ask for a quote, compliance check, or communication summary.",
      model: "Mock OpenClaw Proxy",
    },
  ])
  const [input, setInput] = useState("")
  const [loadingLeads, setLoadingLeads] = useState(true)
  const [loadingTimeline, setLoadingTimeline] = useState(false)
  const [sending, setSending] = useState(false)

  const selectedLead = useMemo(
    () => leads.find((lead) => lead.id === selectedLeadId) ?? null,
    [leads, selectedLeadId]
  )

  useEffect(() => {
    async function loadLeads() {
      try {
        const response = await fetch("/api/leads")
        const data = (await response.json()) as { leads?: Lead[] }
        setLeads(data.leads ?? [])
      } finally {
        setLoadingLeads(false)
      }
    }

    void loadLeads()
  }, [])

  useEffect(() => {
    if (!selectedLeadId) {
      return
    }

    async function loadTimeline() {
      setLoadingTimeline(true)
      try {
        const response = await fetch(`/api/leads/${selectedLeadId}/conversation`)
        const data = (await response.json()) as { logs?: TimelineEvent[] }
        setTimeline(data.logs ?? [])
      } finally {
        setLoadingTimeline(false)
      }
    }

    void loadTimeline()
  }, [selectedLeadId])

  async function updateCampaignStatus(status: string) {
    if (!selectedLeadId) {
      return
    }

    await fetch(`/api/leads/${selectedLeadId}/campaign`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    })

    setLeads((current) =>
      current.map((lead) => (lead.id === selectedLeadId ? { ...lead, campaignStatus: status } : lead))
    )
  }

  async function sendMessage(overrideText?: string) {
    const nextText = (overrideText ?? input).trim()
    if (!nextText || sending) {
      return
    }

    const nextUserMessage: Message = { id: crypto.randomUUID(), role: "user", content: nextText }
    const nextMessages = [...messages, nextUserMessage]

    setMessages(nextMessages)
    setInput("")
    setSending(true)

    try {
      const response = await fetch("/api/internal/openclaw/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lead: selectedLead,
          messages: nextMessages.map(({ role, content }) => ({ role, content })),
        }),
      })

      const data = (await response.json()) as { assistant?: string }
      setMessages((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: data.assistant ?? "No assistant response returned.",
          model: "Mock OpenClaw Proxy",
        },
      ])
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[340px_1fr]">
      <div className="grid gap-6">
        <Card className="border-border/70 bg-card/80">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm uppercase tracking-[0.18em] text-muted-foreground">
              <Search className="size-4 text-primary" />
              Active Leads
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2">
            {loadingLeads ? <p className="text-sm text-muted-foreground">Loading leads...</p> : null}
            {leads.map((lead) => (
              <button
                key={lead.id}
                type="button"
                onClick={() => setSelectedLeadId(lead.id)}
                className={[
                  "rounded-2xl border px-4 py-3 text-left transition",
                  selectedLeadId === lead.id
                    ? "border-primary/60 bg-primary/10"
                    : "border-border/60 bg-background/70 hover:border-primary/40 hover:bg-muted/40",
                ].join(" ")}
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium">
                      {lead.firstName} {lead.lastName}
                    </p>
                    <p className="text-sm text-muted-foreground">{lead.loanPurpose}</p>
                  </div>
                  <Badge variant={lead.campaignStatus === "ACTIVE" ? "default" : "secondary"}>
                    {lead.campaignStatus}
                  </Badge>
                </div>
              </button>
            ))}
          </CardContent>
        </Card>

        <Card className="border-border/70 bg-card/80">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <History className="size-4 text-primary" />
              Lead Timeline
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            {!selectedLead ? (
              <p className="text-sm text-muted-foreground">Choose a lead to load recent communication history.</p>
            ) : null}
            {loadingTimeline ? <p className="text-sm text-muted-foreground">Loading timeline...</p> : null}
            {timeline.map((event) => (
              <div key={event.id} className="rounded-2xl border border-border/60 bg-background/70 p-4">
                <div className="flex items-center justify-between gap-3 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  <span className="flex items-center gap-2">
                    {event.channel === "Email" ? <Mail className="size-3" /> : <MessageSquare className="size-3" />}
                    {event.direction} {event.channel}
                  </span>
                  <span>{new Date(event.sentAt).toLocaleDateString()}</span>
                </div>
                <p className="mt-3 text-sm leading-6">{event.description}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="flex min-h-[720px] flex-col border-border/70 bg-card/80">
        <CardHeader className="border-b border-border/60">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-2">
              <CardTitle className="flex items-center gap-3 text-2xl">
                <div className="rounded-2xl bg-primary/10 p-2">
                  <Bot className="size-6 text-primary" />
                </div>
                Nyra Assistant
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Lead-aware assistant shell merged from the original `webapp` assistant route.
              </p>
            </div>
            {selectedLead ? (
              <div className="rounded-2xl border border-border/60 bg-background/80 p-4">
                <p className="font-medium">
                  {selectedLead.firstName} {selectedLead.lastName}
                </p>
                <p className="text-sm text-muted-foreground">
                  {selectedLead.loanPurpose} · ${selectedLead.loanAmount.toLocaleString()}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" onClick={() => void updateCampaignStatus("PAUSED")}>
                    <Pause className="size-3.5" />
                    Pause
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => void updateCampaignStatus("ACTIVE")}>
                    <Play className="size-3.5" />
                    Resume
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => void updateCampaignStatus("COMPLETE")}>
                    <CheckCircle2 className="size-3.5" />
                    Close
                  </Button>
                </div>
              </div>
            ) : null}
          </div>
        </CardHeader>

        <CardContent className="flex flex-1 flex-col gap-4 p-6">
          {selectedLead ? (
            <div className="flex flex-wrap gap-2">
              {quickActions.map((action) => (
                <Button key={action} variant="outline" size="sm" onClick={() => void sendMessage(action)}>
                  {action.includes("quote") ? <FileText className="size-3.5" /> : <Shield className="size-3.5" />}
                  {action}
                </Button>
              ))}
            </div>
          ) : null}

          <div className="flex-1 space-y-4 overflow-y-auto rounded-[1.5rem] border border-border/60 bg-background/70 p-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {message.role === "assistant" ? (
                  <Avatar className="size-9 border border-border/60">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      <Bot className="size-4" />
                    </AvatarFallback>
                  </Avatar>
                ) : null}

                <div
                  className={[
                    "max-w-[82%] rounded-3xl px-4 py-3 text-sm leading-6 shadow-sm",
                    message.role === "assistant"
                      ? "rounded-tl-md border border-border/60 bg-card"
                      : "rounded-tr-md bg-primary text-primary-foreground",
                  ].join(" ")}
                >
                  <p>{message.content}</p>
                  {message.model ? <p className="mt-2 text-xs opacity-70">{message.model}</p> : null}
                </div>

                {message.role === "user" ? (
                  <Avatar className="size-9 border border-border/60">
                    <AvatarFallback className="bg-muted text-foreground">
                      <User className="size-4" />
                    </AvatarFallback>
                  </Avatar>
                ) : null}
              </div>
            ))}
            {sending ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="size-4 animate-spin" />
                Waiting for proxy response...
              </div>
            ) : null}
          </div>

          <form
            onSubmit={(event) => {
              event.preventDefault()
              void sendMessage()
            }}
            className="flex gap-3"
          >
            <Input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder={selectedLead ? "Ask Nyra about this lead..." : "Select a lead first..."}
              disabled={!selectedLead}
            />
            <Button type="submit" disabled={!selectedLead || !input.trim() || sending}>
              <Send className="size-4" />
              Send
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
