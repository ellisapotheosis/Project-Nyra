'use client';

import React from 'react';
import { Badge } from "@/components/ui/badge";
import {
  User,
  Mail,
  MessageSquare,
  Phone,
  PhoneMissed,
  CheckCircle2,
  Clock
} from "lucide-react";
import { ConversationLog } from "@/lib/api/crm";

interface TimelineProps {
  logs: ConversationLog[];
  isLoading?: boolean;
  leadName?: string;
}

export function Timeline({ logs, isLoading, leadName = "Lead" }: TimelineProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-4">
        <Clock className="h-8 w-8 text-primary/50 animate-pulse" />
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">SYNCING_HISTORY...</p>
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-3">
        <div className="p-4 rounded-lg bg-primary/5 border border-primary/10 shadow-inner">
          <Clock className="h-8 w-8 text-primary/30" />
        </div>
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-50">NO_ACTIVITY_LOGS</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      {logs.map((log, index) => {
        const isOutbound = log.direction === 'outbound';
        const Icon = getIconForChannel(log.channel);
        const colorClass = getColorForChannel(log.channel);

        return (
          <div
            key={index}
            className={`flex items-start gap-4 ${isOutbound ? 'flex-row-reverse' : ''}`}
          >
            <div className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 shadow-xl border border-border/50 ${colorClass}`}>
              <Icon className="h-5 w-5" />
            </div>
            <div className={`flex-1 p-5 rounded-lg shadow-2xl border backdrop-blur-md ${
              isOutbound
                ? 'bg-primary/5 border-primary/20 rounded-tr-none'
                : 'bg-card/40 border-border/40 rounded-tl-none'
            }`}>
              <div className="flex justify-between items-center mb-3">
                <span className={`text-[10px] font-black uppercase tracking-widest ${isOutbound ? 'text-primary' : 'text-emerald-300'}`}>
                  {isOutbound ? 'SYSTEM_NYRA' : leadName.toUpperCase()} • {log.channel.toUpperCase()}
                </span>
                <span className="text-[9px] font-bold text-muted-foreground uppercase opacity-50">
                  {new Date(log.sent_at).toLocaleString([], {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
              {log.channel === 'email' && log.content_preview.includes('Subject:') && (
                <div className="text-xs text-foreground font-black mb-2 bg-background/50 p-2 rounded border border-border/30">
                  {log.content_preview.split('\n')[0]}
                </div>
              )}
              <p className={`text-sm leading-relaxed ${isOutbound ? 'text-primary-foreground' : 'text-foreground/90'} font-medium tracking-tight`}>
                {log.channel === 'email'
                  ? log.content_preview.split('\n').slice(1).join('\n')
                  : log.content_preview}
              </p>
              {isOutbound && (
                <div className="mt-4 flex items-center gap-2">
                  <Badge className="bg-emerald-500 text-black text-[8px] font-black px-1.5 py-0">DELIVERED</Badge>
                  <div className="h-px flex-1 bg-emerald-500/10" />
                </div>
              )}
            </div>
          </div>
        );
      })}

      {/* System Note Example */}
      <div className="flex justify-center my-8">
        <Badge variant="outline" className="bg-background/50 text-muted-foreground border-border/50 px-4 py-1 text-[10px] font-black tracking-widest uppercase shadow-xl">
          <Clock className="h-3 w-3 mr-2 text-primary" />
          TIMESTAMP_SYNC: {new Date().toLocaleDateString()}
        </Badge>
      </div>
    </div>
  );
}

function getIconForChannel(channel: string) {
  switch (channel.toLowerCase()) {
    case 'sms': return MessageSquare;
    case 'email': return Mail;
    case 'call': return Phone;
    case 'voicemail': return PhoneMissed;
    default: return User;
  }
}

function getColorForChannel(channel: string) {
  switch (channel.toLowerCase()) {
    case 'sms': return 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20';
    case 'email': return 'bg-primary/10 text-primary border-primary/20';
    case 'voicemail': return 'bg-destructive/10 text-destructive border-destructive/20';
    default: return 'bg-muted/10 text-muted-foreground border-border/50';
  }
}

function PhoneCall(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
      <path d="M14.05 2a9 9 0 0 1 8 8" />
      <path d="M14.05 6A5 5 0 0 1 18 10" />
    </svg>
  );
}
