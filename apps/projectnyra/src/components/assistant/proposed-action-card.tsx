"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  XCircle,
  Send,
  Mail,
  MessageSquare,
  Clock,
  AlertTriangle,
} from "lucide-react";

export interface ProposedAction {
  id: string;
  type: "email" | "sms" | "status_change" | "quote";
  title: string;
  description: string;
  preview?: string;
  toolName: string;
  risk:
    | "INTERNAL_MUTATION"
    | "CRM_MUTATION"
    | "DATABASE_MUTATION"
    | "BORROWER_COMMUNICATION";
  auditEventId: string;
  metadata?: Record<string, unknown>;
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
    <Card className="overflow-hidden border-l-4 border-l-pink-500 bg-card/70 shadow-sm">
      <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
        <div className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded-lg bg-pink-500/10 flex items-center justify-center text-pink-300">
            <Icon className="h-4 w-4" />
          </div>
          <div>
            <CardTitle className="text-sm font-bold">{action.title}</CardTitle>
            <p className="text-[10px] text-pink-300 uppercase font-bold tracking-widest flex items-center">
              <AlertTriangle className="mr-1 h-3 w-3" /> Assistant Proposal
            </p>
          </div>
        </div>
        <Badge
          variant="outline"
          className="bg-pink-500/10 text-pink-300 border-pink-500/30 text-[10px]"
        >
          Pending Approval
        </Badge>
      </CardHeader>

      <CardContent className="space-y-3 pt-2">
        <p className="text-xs text-muted-foreground leading-relaxed">
          {action.description}
        </p>

        {action.preview && (
          <div className="p-3 bg-background/60 rounded-lg border border-border/40 text-[11px] text-muted-foreground italic line-clamp-3">
            "{action.preview}"
          </div>
        )}
        <div className="grid gap-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">
          <span>Tool: {action.toolName}</span>
          <span>Audit: {action.auditEventId}</span>
        </div>
      </CardContent>

      <CardFooter className="bg-muted/20 border-t border-border/30 p-3 grid grid-cols-2 gap-2">
        <Button
          variant="outline"
          size="sm"
          className="h-8 text-xs hover:bg-pink-500/10 hover:text-pink-300 hover:border-pink-500/30 transition-all"
          onClick={() => onReject(action.id)}
          disabled={isProcessing}
        >
          <XCircle className="mr-1.5 h-3.5 w-3.5" />
          Reject
        </Button>
        <Button
          size="sm"
          className="h-8 text-xs bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm transition-all"
          onClick={() => onApprove(action.id)}
          disabled={isProcessing}
        >
          <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
          Approve & Execute
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
    case "quote":
      return Send;
    default:
      return Send;
  }
}
