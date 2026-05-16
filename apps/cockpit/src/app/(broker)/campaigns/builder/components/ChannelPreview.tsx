"use client";

import React from "react";
import { Mail, MessageSquare, Phone, User, Play, Clock } from "lucide-react";
import { Badge } from "@nyra/ui";
import { Button } from "@nyra/ui";
import { Card, CardContent } from "@nyra/ui";

interface ChannelPreviewProps {
  channel: "email" | "sms" | "voice" | "missed_call_ping";
  templateId: string;
}

export function ChannelPreview({ channel, templateId }: ChannelPreviewProps) {
  if (!templateId) {
    return (
      <div className="flex items-center justify-center h-32 border-2 border-dashed border-border/50 rounded-lg bg-primary/5 backdrop-blur-sm">
        <p className="text-[10px] text-primary font-black uppercase tracking-widest italic opacity-50">
          WAITING_FOR_SELECTION
        </p>
      </div>
    );
  }

  switch (channel) {
    case "email":
      return (
        <Card className="border-border/50 shadow-2xl overflow-hidden bg-card/40 backdrop-blur-md">
          <div className="bg-primary/10 px-4 py-2 border-b border-border/50 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="h-6 w-6 rounded-lg bg-primary/20 flex items-center justify-center border border-primary/20">
                <Mail className="h-3 w-3 text-primary" />
              </div>
              <span className="text-[10px] font-black text-primary uppercase tracking-widest">
                PROTOCOL: EMAIL
              </span>
            </div>
          </div>
          <CardContent className="p-5 space-y-4">
            <div className="space-y-1 bg-background/40 p-2 rounded-lg border border-border/30 shadow-inner">
              <p className="text-[9px] text-muted-foreground font-black uppercase tracking-tight">
                Subject
              </p>
              <p className="text-xs font-bold text-foreground leading-tight">
                {templateId === "welcome_quote"
                  ? "📉 Rates just dropped - Good news for your refinance!"
                  : "Follow-up regarding your mortgage inquiry"}
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground leading-relaxed italic opacity-80">
                {templateId === "welcome_quote"
                  ? "Hi John, great news. We saw a dip in the market today that puts you in a great position to refinance your loan..."
                  : "Hi there, I wanted to follow up on our previous conversation regarding your mortgage options..."}
              </p>
              <div className="h-1.5 w-3/4 bg-primary/10 rounded-full" />
              <div className="h-1.5 w-1/2 bg-primary/5 rounded-full" />
            </div>
          </CardContent>
        </Card>
      );

    case "sms":
      return (
        <div className="flex flex-col space-y-3">
          <div className="flex items-center space-x-2 px-1">
            <MessageSquare className="h-3 w-3 text-emerald-300" />
            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
              DISPATCH: SMS
            </span>
          </div>
          <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 p-4 rounded-lg rounded-tr-sm shadow-2xl max-w-[90%] border-l-2 border-l-emerald-500">
            <p className="text-xs font-bold leading-relaxed">
              {templateId === "follow_up_day1"
                ? "Hey John, it's Ellis. Just wanted to make sure you got my email about the rate drop. Let me know if you have 5 mins!"
                : "Hi! This is a reminder about your scheduled mortgage consultation. See you soon!"}
            </p>
          </div>
          <p className="text-[9px] font-black text-muted-foreground ml-1 uppercase tracking-tight opacity-40">
            DELIVERED_SUCCESS • JUST_NOW
          </p>
        </div>
      );

    case "voice":
    case "missed_call_ping":
      return (
        <Card className="border-border/50 shadow-2xl bg-black/60 backdrop-blur-xl overflow-hidden rounded-lg border-t-2 border-t-destructive">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-lg bg-destructive/20 border border-destructive/30 flex items-center justify-center shadow-lg">
                  <Phone className="h-5 w-5 text-destructive" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-destructive uppercase tracking-widest leading-none">
                    VOICE_AGENT_AI
                  </p>
                  <p className="text-[9px] font-bold text-muted-foreground mt-1 uppercase tracking-tight">
                    Kyutai PocketTTS Wrapper
                  </p>
                </div>
              </div>
              <Badge className="bg-destructive/20 text-destructive border border-destructive/30 text-[9px] font-black tracking-widest">
                PREVIEW
              </Badge>
            </div>

            <div className="bg-primary/5 rounded-lg p-4 border border-primary/10 shadow-inner">
              <div className="flex items-center space-x-4">
                <Button
                  size="icon"
                  className="h-10 w-10 rounded-full bg-primary hover:bg-primary/80 text-white shrink-0 shadow-lg"
                >
                  <Play className="h-4 w-4 fill-current" />
                </Button>
                <div className="flex-1 space-y-2">
                  <div className="flex items-end space-x-0.5 h-8">
                    {[
                      0.2, 0.4, 0.8, 0.3, 0.9, 0.6, 0.2, 0.5, 0.7, 0.4, 0.3,
                      0.6, 0.8, 0.5, 0.3, 0.7, 0.9, 0.2, 0.4, 0.6
                    ].map((h, i) => (
                      <div
                        key={i}
                        className="flex-1 bg-emerald-400/40 rounded-t-sm"
                        style={{ height: `${h * 100}%` }}
                      />
                    ))}
                  </div>
                  <div className="flex justify-between text-[8px] font-black text-muted-foreground uppercase tracking-widest font-mono">
                    <span>0:00</span>
                    <span>0:45</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <p className="text-[10px] text-muted-foreground italic font-medium leading-relaxed line-clamp-1 border-l border-border/50 pl-3">
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
