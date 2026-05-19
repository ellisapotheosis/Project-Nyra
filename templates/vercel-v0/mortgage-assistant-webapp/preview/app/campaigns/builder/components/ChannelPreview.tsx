"use client";

import React from "react";
import { Mail, MessageSquare, Phone, User, Play, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface ChannelPreviewProps {
  channel: "email" | "sms" | "voice" | "missed_call_ping";
  templateId: string;
}

export function ChannelPreview({ channel, templateId }: ChannelPreviewProps) {
  if (!templateId) {
    return (
      <div className="flex items-center justify-center h-32 border-2 border-dashed border-slate-200 rounded-lg bg-slate-50/50">
        <p className="text-xs text-slate-400 font-medium italic">
          Select a template to preview
        </p>
      </div>
    );
  }

  switch (channel) {
    case "email":
      return (
        <Card className="border-slate-200 shadow-sm overflow-hidden bg-white">
          <div className="bg-slate-50 px-4 py-2 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="h-6 w-6 rounded-full bg-red-100 flex items-center justify-center">
                <Mail className="h-3 w-3 text-red-600" />
              </div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                Email Preview
              </span>
            </div>
          </div>
          <CardContent className="p-4 space-y-3">
            <div className="space-y-1">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">
                Subject
              </p>
              <p className="text-sm font-semibold text-slate-900 leading-tight">
                {templateId === "welcome_quote"
                  ? "📉 Rates just dropped - Good news for your refinance!"
                  : "Follow-up regarding your mortgage inquiry"}
              </p>
            </div>
            <div className="h-px bg-slate-100 w-full" />
            <div className="space-y-2">
              <p className="text-xs text-slate-600 leading-relaxed italic">
                {templateId === "welcome_quote"
                  ? "Hi John, great news. We saw a dip in the market today that puts you in a great position to refinance your loan..."
                  : "Hi there, I wanted to follow up on our previous conversation regarding your mortgage options..."}
              </p>
              <div className="h-2 w-3/4 bg-slate-100 rounded" />
              <div className="h-2 w-1/2 bg-slate-100 rounded" />
            </div>
          </CardContent>
        </Card>
      );

    case "sms":
      return (
        <div className="flex flex-col space-y-2">
          <div className="flex items-center space-x-2 px-1">
            <MessageSquare className="h-3 w-3 text-blue-500" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              SMS Preview
            </span>
          </div>
          <div className="bg-blue-600 text-white p-3 rounded-2xl rounded-tr-sm shadow-sm max-w-[90%]">
            <p className="text-xs leading-relaxed">
              {templateId === "follow_up_day1"
                ? "Hey John, it's Ellis. Just wanted to make sure you got my email about the rate drop. Let me know if you have 5 mins!"
                : "Hi! This is a reminder about your scheduled mortgage consultation. See you soon!"}
            </p>
          </div>
          <p className="text-[10px] text-slate-400 ml-1">
            Delivered • Just now
          </p>
        </div>
      );

    case "voice":
    case "missed_call_ping":
      return (
        <Card className="border-slate-200 shadow-sm bg-slate-900 text-white overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 rounded-full bg-slate-800 flex items-center justify-center">
                  <Phone className="h-4 w-4 text-blue-400" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">
                    Voice AI
                  </p>
                  <p className="text-xs font-semibold mt-1">
                    Text-to-Speech (ElevenLabs)
                  </p>
                </div>
              </div>
              <Badge className="bg-blue-500/20 text-blue-400 border-none text-[10px]">
                PREVIEW
              </Badge>
            </div>

            <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
              <div className="flex items-center space-x-3">
                <Button
                  size="icon"
                  className="h-8 w-8 rounded-full bg-blue-600 hover:bg-blue-700 shrink-0"
                >
                  <Play className="h-4 w-4 fill-white" />
                </Button>
                <div className="flex-1 space-y-1">
                  <div className="flex items-end space-x-0.5 h-6">
                    {[
                      0.2, 0.4, 0.8, 0.3, 0.9, 0.6, 0.2, 0.5, 0.7, 0.4, 0.3,
                      0.6,
                    ].map((h, i) => (
                      <div
                        key={i}
                        className="flex-1 bg-blue-500/40 rounded-t-sm"
                        style={{ height: `${h * 100}%` }}
                      />
                    ))}
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>0:00</span>
                    <span>0:45</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-3">
              <p className="text-[10px] text-slate-500 italic line-clamp-1">
                "Hi John, this is an automated message from your mortgage
                advisor..."
              </p>
            </div>
          </CardContent>
        </Card>
      );

    default:
      return null;
  }
}
