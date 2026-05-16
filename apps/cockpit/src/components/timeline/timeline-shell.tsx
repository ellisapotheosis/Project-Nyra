import { CheckCircle2, Clock, Mail, MessageSquare, PhoneCall, PhoneMissed, User } from "lucide-react"

import { Badge } from "@nyra/ui"
import type { ConversationLog } from "@/lib/api/crm"

type TimelineShellProps = {
  logs: ConversationLog[]
  isLoading?: boolean
  leadName?: string
}

export function TimelineShell({ logs, isLoading, leadName = "Lead" }: TimelineShellProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-24 text-muted-foreground border-2 border-dashed border-primary/20 bg-primary/5 rounded-lg">
        <Clock className="size-10 animate-pulse text-primary/50" />
        <p className="text-[10px] font-black uppercase tracking-widest">RETRIEVING_ACTIVITY...</p>
      </div>
    )
  }

  if (logs.length === 0) {
    return (
      <div className="rounded-lg border-2 border-dashed border-primary/20 bg-primary/5 p-24 text-center text-[10px] font-black uppercase tracking-widest text-muted-foreground shadow-inner">
        NO_TIMELINE_EVENTS_BUFFERED
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {logs.map((log, index) => {
        const isOutbound = log.direction === "outbound"
        const Icon = iconForChannel(log.channel)
        const colorClass = isOutbound ? "text-emerald-300 bg-emerald-500/10 border-emerald-500/20" : "text-primary bg-primary/10 border-primary/20"

        return (
          <div key={`${log.sent_at}-${index}`} className="grid gap-6 rounded-lg border border-border/50 bg-card/40 backdrop-blur-md p-6 shadow-xl hover:shadow-primary/5 transition-all group border-t-2 border-t-primary md:grid-cols-[56px_1fr]">
            <div className={`flex size-14 items-center justify-center rounded-lg border shadow-inner ${colorClass}`}>
              <Icon className="size-6" />
            </div>
            <div className="min-w-0 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="font-black text-foreground uppercase tracking-tight">{isOutbound ? "SYSTEM_NYRA" : leadName.toUpperCase()}</span>
                  <Badge variant="outline" className="rounded-lg text-[9px] font-black uppercase tracking-widest bg-background/50 border-border/50">
                    {log.channel}
                  </Badge>
                  <Badge variant="outline" className={`rounded-lg text-[9px] font-black uppercase tracking-widest border-none ${isOutbound ? 'bg-emerald-500 text-black' : 'bg-primary text-white'}`}>
                    {log.direction}
                  </Badge>
                </div>
                <span className="text-[9px] font-black text-muted-foreground uppercase opacity-50 tracking-widest">
                  {new Date(log.sent_at).toLocaleString([], {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              <div className="p-4 rounded-lg bg-background/50 border border-border/30 shadow-inner group-hover:bg-background/80 transition-colors">
                {log.channel === "email" && log.content_preview.includes("Subject:") && (
                  <p className="text-[11px] font-black text-primary uppercase tracking-tight mb-2 border-b border-border/30 pb-2">{log.content_preview.split("\n")[0]}</p>
                )}
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90 font-medium tracking-tight italic">
                  {log.channel === "email" ? log.content_preview.split("\n").slice(1).join("\n") : log.content_preview}
                </p>
              </div>
              {isOutbound && (
                <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] text-emerald-300 px-1">
                  <CheckCircle2 className="size-3 shadow-[0_0_8px_rgba(20,184,166,0.5)]" />
                  DELIVERED_SUCCESS
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function iconForChannel(channel: string) {
  switch (channel.toLowerCase()) {
    case "sms":
      return MessageSquare
    case "email":
      return Mail
    case "call":
      return PhoneCall
    case "voicemail":
      return PhoneMissed
    default:
      return User
  }
}
