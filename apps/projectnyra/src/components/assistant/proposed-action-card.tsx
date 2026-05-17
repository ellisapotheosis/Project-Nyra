"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@nyra/ui";
import { Button } from "@nyra/ui";
import { Badge } from "@nyra/ui";
import {
  CheckCircle2,
  XCircle,
  Send,
  Mail,
  MessageSquare,
  Clock,
  Zap,
} from "lucide-react";

interface ProposedAction {
  id: string;
  type: "email" | "sms" | "status_change";
  title: string;
  description: string;
  preview?: string;
  metadata?: any;
}

interface ProposedActionCardProps {
  action: ProposedAction;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  isProcessing?: boolean;
}

export function ProposedActionCard({
  action,
  onApprove,
  onReject,
  isProcessing,
}: ProposedActionCardProps) {
  const Icon = getIconForType(action.type);

  return (
    <Card className="border-l-4 border-l-destructive bg-destructive/5 shadow-2xl overflow-hidden backdrop-blur-md border border-border/50">
      <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0 border-b border-destructive/10 bg-background/20">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-lg bg-destructive/10 border border-destructive/20 flex items-center justify-center text-destructive shadow-lg">
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-sm font-black text-foreground uppercase tracking-tight">
              {action.title}
            </CardTitle>
            <p className="text-[9px] text-destructive uppercase font-black tracking-widest flex items-center mt-0.5">
              <Zap className="mr-1 h-3 w-3 animate-pulse" /> ASSISTANT_PROPOSAL
            </p>
          </div>
        </div>
        <Badge className="bg-destructive text-white text-[9px] font-black uppercase tracking-widest px-2 shadow-[0_0_8px_rgba(236,72,153,0.4)]">
          PENDING_APPROVAL
        </Badge>
      </CardHeader>

      <CardContent className="space-y-4 pt-5">
        <p className="text-[11px] font-bold text-muted-foreground uppercase leading-relaxed tracking-tight">
          {action.description}
        </p>

        {action.preview && (
          <div className="p-4 bg-background/60 rounded-lg border border-border/50 text-[11px] text-foreground font-medium italic leading-relaxed shadow-inner border-l-2 border-l-emerald-500">
            "{action.preview}"
          </div>
        )}
      </CardContent>

      <CardFooter className="bg-background/40 border-t border-border/50 p-4 grid grid-cols-2 gap-3">
        <Button
          variant="outline"
          size="sm"
          className="h-10 text-[10px] font-black uppercase tracking-widest border-border/50 bg-background/60 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-all rounded-lg"
          onClick={() => onReject(action.id)}
          disabled={isProcessing}
        >
          <XCircle className="mr-2 h-4 w-4" />
          REJECT
        </Button>
        <Button
          size="sm"
          className="h-10 text-[10px] font-black uppercase tracking-widest bg-emerald-500 hover:bg-emerald-500 text-black shadow-lg shadow-emerald-500/20 transition-all rounded-lg active:scale-95"
          onClick={() => onApprove(action.id)}
          disabled={isProcessing}
        >
          <CheckCircle2 className="mr-2 h-4 w-4" />
          EXECUTE_PROTOCOL
        </Button>
      </CardFooter>
    </Card>
  );
}

function getIconForType(type: string) {
  switch (type) {
    case "email":
      return Mail;
    case "sms":
      return MessageSquare;
    case "status_change":
      return Clock;
    default:
      return Zap;
  }
}
