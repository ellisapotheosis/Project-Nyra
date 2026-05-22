"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Mail,
  MessageSquare,
  PhoneMissed,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { ConversationLog } from "@/lib/api/crm";

interface TimelineProps {
  logs: ConversationLog[];
  isLoading?: boolean;
  leadName?: string;
}

export function Timeline({
  logs,
  isLoading,
  leadName = "Lead",
}: TimelineProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-4">
        <Clock className="h-8 w-8 text-muted-foreground animate-pulse" />
        <p className="text-sm text-muted-foreground">
          Loading activity history...
        </p>
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="flex items-center justify-center p-12 text-muted-foreground italic">
        No activity history found for this lead.
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {logs.map((log, index) => {
        const isOutbound = log.direction === "outbound";
        const Icon = getIconForChannel(log.channel);
        const colorClass = getColorForChannel(log.channel);

        return (
          <div
            key={index}
            className={`flex items-start space-x-4 ${isOutbound ? "flex-row-reverse space-x-reverse" : ""}`}
          >
            <div
              className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${colorClass}`}
            >
              <Icon className="h-5 w-5" />
            </div>
            <div
              className={`flex-1 p-4 rounded-2xl shadow-sm border ${
                isOutbound
                  ? "bg-indigo-500/10 border-indigo-500/20 rounded-tr-none"
                  : "bg-muted/30 border-border/40 rounded-tl-none"
              }`}
            >
              <div className="flex justify-between items-center mb-2">
                <span
                  className={`text-xs font-bold uppercase tracking-tighter ${isOutbound ? "text-indigo-300" : "text-foreground"}`}
                >
                  {isOutbound ? "Nyra Engine" : leadName} • {log.channel}
                </span>
                <span className="text-[10px] font-bold text-muted-foreground/60 uppercase">
                  {new Date(log.sent_at).toLocaleString([], {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              {log.channel === "email" &&
                log.content_preview.includes("Subject:") && (
                  <div className="text-xs text-indigo-400/80 font-bold mb-1.5 uppercase tracking-tight">
                    {log.content_preview.split("\n")[0]}
                  </div>
                )}
              <p
                className={`text-sm leading-relaxed ${isOutbound ? "text-indigo-100/90" : "text-muted-foreground"}`}
              >
                {log.channel === "email"
                  ? log.content_preview.split("\n").slice(1).join("\n")
                  : log.content_preview}
              </p>
              {isOutbound && (
                <div className="mt-4 flex items-center gap-1.5">
                  <CheckCircle2 className="h-3 w-3 text-turquoise-400" />
                  <span className="text-[9px] font-black text-turquoise-400/80 uppercase tracking-widest">
                    Verified Sync
                  </span>
                </div>
              )}
            </div>
          </div>
        );
      })}

      {/* System Note Example */}
      <div className="flex justify-center my-8">
        <Badge
          variant="outline"
          className="bg-card/40 text-muted-foreground/60 border-border/40 px-4 py-1 text-[10px] font-bold uppercase tracking-[0.2em]"
        >
          <Clock className="h-3 w-3 mr-2" />
          Timeline Pulse: {new Date().toLocaleDateString()}
        </Badge>
      </div>
    </div>
  );
}

function getIconForChannel(channel: string) {
  switch (channel.toLowerCase()) {
    case "sms":
      return MessageSquare;
    case "email":
      return Mail;
    case "call":
      return PhoneCall;
    case "voicemail":
      return PhoneMissed;
    default:
      return User;
  }
}

function getColorForChannel(channel: string) {
  switch (channel.toLowerCase()) {
    case "sms":
      return "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-[0_0_15px_-3px_rgba(var(--indigo-rgb),0.2)]";
    case "email":
      return "bg-pink-500/10 text-pink-400 border border-pink-500/20 shadow-[0_0_15px_-3px_rgba(var(--pink-rgb),0.2)]";
    case "voicemail":
      return "bg-amber-500/10 text-amber-400 border border-amber-500/20";
    default:
      return "bg-muted/40 text-muted-foreground border border-border/40";
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
