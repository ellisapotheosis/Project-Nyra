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
                  ? "bg-blue-50 border-blue-100 rounded-tr-sm"
                  : "bg-white border-slate-100 rounded-tl-sm"
              }`}
            >
              <div className="flex justify-between items-center mb-2">
                <span
                  className={`text-sm font-semibold ${isOutbound ? "text-blue-900" : "text-slate-900"}`}
                >
                  {isOutbound ? "System" : leadName} (
                  {log.channel.toUpperCase()})
                </span>
                <span className="text-xs text-slate-400">
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
                  <div className="text-sm text-blue-800 font-medium mb-1">
                    {log.content_preview.split("\n")[0]}
                  </div>
                )}
              <p
                className={`text-sm ${isOutbound ? "text-blue-700" : "text-slate-700"}`}
              >
                {log.channel === "email"
                  ? log.content_preview.split("\n").slice(1).join("\n")
                  : log.content_preview}
              </p>
              {isOutbound && (
                <div className="mt-3 flex items-center">
                  <CheckCircle2 className="h-3 w-3 mr-1 text-green-500" />
                  <span className="text-[10px] text-blue-500 font-medium uppercase">
                    Delivered
                  </span>
                </div>
              )}
            </div>
          </div>
        );
      })}

      {/* System Note Example */}
      <div className="flex justify-center my-6">
        <Badge
          variant="outline"
          className="bg-white text-slate-400 border-slate-200 px-4 py-1 text-xs"
        >
          <Clock className="h-3 w-3 mr-1" />
          Timeline updated - {new Date().toLocaleDateString()}
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
      return "bg-slate-200 text-slate-500";
    case "email":
      return "bg-blue-100 text-blue-600";
    case "voicemail":
      return "bg-purple-100 text-purple-600";
    default:
      return "bg-slate-200 text-slate-500";
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
