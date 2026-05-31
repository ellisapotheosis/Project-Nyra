'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  XCircle,
  Send,
  Mail,
  MessageSquare,
  Clock,
  AlertTriangle
} from "lucide-react";

interface ProposedAction {
  id: string;
  type: 'email' | 'sms' | 'status_change';
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

export function ProposedActionCard({ action, onApprove, onReject, isProcessing }: ProposedActionCardProps) {
  const Icon = getIconForType(action.type);

  return (
    <Card className="border-l-4 border-l-amber-500 bg-amber-50/20 shadow-sm overflow-hidden">
      <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
        <div className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600">
            <Icon className="h-4 w-4" />
          </div>
          <div>
            <CardTitle className="text-sm font-bold">{action.title}</CardTitle>
            <p className="text-[10px] text-amber-600 uppercase font-bold tracking-widest flex items-center">
              <AlertTriangle className="mr-1 h-3 w-3" /> Assistant Proposal
            </p>
          </div>
        </div>
        <Badge variant="outline" className="bg-white text-amber-600 border-amber-200 text-[10px]">
          Pending Approval
        </Badge>
      </CardHeader>

      <CardContent className="space-y-3 pt-2">
        <p className="text-xs text-slate-600 leading-relaxed">
          {action.description}
        </p>

        {action.preview && (
          <div className="p-3 bg-white rounded-lg border border-amber-100 text-[11px] text-slate-500 italic line-clamp-3">
            "{action.preview}"
          </div>
        )}
      </CardContent>

      <CardFooter className="bg-amber-50/50 border-t border-amber-100 p-3 grid grid-cols-2 gap-2">
        <Button
          variant="outline"
          size="sm"
          className="h-8 text-xs bg-white hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all"
          onClick={() => onReject(action.id)}
          disabled={isProcessing}
        >
          <XCircle className="mr-1.5 h-3.5 w-3.5" />
          Reject
        </Button>
        <Button
          size="sm"
          className="h-8 text-xs bg-amber-600 hover:bg-amber-700 text-white shadow-sm transition-all"
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
    case 'email': return Mail;
    case 'sms': return MessageSquare;
    case 'status_change': return Clock;
    default: return Send;
  }
}
