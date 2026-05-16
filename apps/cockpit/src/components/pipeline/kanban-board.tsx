"use client";

import React, { useState, useEffect } from "react";
import { Badge, Card, CardContent } from "@nyra/ui";
import {
  MoreHorizontal,
  Phone,
  Mail,
  Calendar,
  AlertCircle,
  Clock,
  ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";

type LeadStatus = "NEW" | "CONTACTED" | "QUALIFIED" | "PRE_APPROVED" | "APPLICATION" | "PROCESSING" | "APPROVED" | "CLOSED";

interface Lead {
  id: string;
  status: LeadStatus;
  borrower: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  loanRequest?: {
    amount: number;
    propertyType: string;
  };
  createdAt: string;
}

const COLUMNS: { id: LeadStatus; title: string; color: string; shadow: string }[] = [
  { id: "NEW", title: "New Leads", color: "bg-indigo-500", shadow: "shadow-[0_0_10px_rgba(99,102,241,0.5)]" },
  { id: "CONTACTED", title: "Contacted", color: "bg-turquoise-400", shadow: "shadow-[0_0_10px_rgba(20,184,166,0.5)]" },
  { id: "QUALIFIED", title: "Qualified", color: "bg-indigo-400", shadow: "shadow-[0_0_10px_rgba(129,140,248,0.5)]" },
  { id: "PRE_APPROVED", title: "Pre-Approved", color: "bg-turquoise-500", shadow: "shadow-[0_0_10px_rgba(20,184,166,0.6)]" },
  { id: "APPLICATION", title: "Application", color: "bg-pink-400", shadow: "shadow-[0_0_10px_rgba(244,63,94,0.5)]" },
  { id: "PROCESSING", title: "Processing", color: "bg-indigo-600", shadow: "shadow-[0_0_10px_rgba(79,70,229,0.5)]" },
  { id: "APPROVED", title: "Approved", color: "bg-turquoise-600", shadow: "shadow-[0_0_10px_rgba(13,148,136,0.5)]" },
  { id: "CLOSED", title: "Closed/Funded", color: "bg-slate-600", shadow: "shadow-[0_0_10px_rgba(71,85,105,0.5)]" },
];

export function KanbanBoard() {
  const [leads, setLeads] = useState<Lead[]>([
    {
      id: '1',
      status: 'NEW',
      borrower: { firstName: 'Sarah', lastName: 'Johnson', email: 'sarah@example.com', phone: '555-0123' },
      loanRequest: { amount: 450000, propertyType: 'PURCHASE' },
      createdAt: new Date().toISOString()
    },
    {
      id: '2',
      status: 'CONTACTED',
      borrower: { firstName: 'Michael', lastName: 'Chen', email: 'michael@example.com', phone: '555-0124' },
      loanRequest: { amount: 620000, propertyType: 'REFINANCE' },
      createdAt: new Date().toISOString()
    }
  ]);
  const [loading, setLoading] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-20rem)] gap-6 overflow-x-auto pb-6 scrollbar-hide">
      {COLUMNS.map((col) => {
        const columnLeads = leads.filter((lead) => lead.status === col.id);

        return (
          <div key={col.id} className="w-80 flex-shrink-0 flex flex-col group">
            <div className="flex items-center justify-between mb-6 px-1">
              <div className="flex items-center space-x-3">
                <div className={cn("w-2 h-2 rounded-full", col.color, col.shadow)}></div>
                <h3 className="font-black text-[10px] text-muted-foreground uppercase tracking-[0.2em]">{col.title}</h3>
                <span className="text-muted-foreground/40 text-[10px] font-black">{columnLeads.length}</span>
              </div>
              <button className="text-muted-foreground/40 hover:text-indigo-400 transition-colors">
                <MoreHorizontal size={14} />
              </button>
            </div>

            <div className="flex-1 space-y-5 min-h-[200px] overflow-y-auto pr-1">
              {columnLeads.map((lead) => (
                <LeadCard key={lead.id} lead={lead} />
              ))}
              {columnLeads.length === 0 && (
                <div className="h-24 flex items-center justify-center border-2 border-dashed border-border/40 rounded-3xl text-muted-foreground/20 text-[9px] font-black uppercase tracking-widest bg-indigo-500/5">
                  IDLE_QUEUE
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function LeadCard({ lead }: { lead: Lead }) {
  const isUrgent = lead.status === "NEW";

  return (
    <Card className="bg-card/40 backdrop-blur-md border-border/50 hover:border-indigo-500/30 transition-all cursor-grab active:cursor-grabbing group overflow-hidden rounded-[24px] shadow-lg border-t-2 border-t-indigo-500/20">
      <CardContent className="p-5">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h4 className="font-black text-xs uppercase tracking-tight text-foreground group-hover:text-indigo-400 transition-colors">
              {lead.borrower.firstName} {lead.borrower.lastName}
            </h4>
            <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5 opacity-40">TRK_{lead.id.substring(0, 4)}</p>
          </div>
          {isUrgent && (
            <Badge className="bg-pink-500/20 text-pink-400 border-none text-[8px] uppercase font-black px-1.5 py-0 shadow-[0_0_8px_rgba(244,63,94,0.3)]">
              URGENT
            </Badge>
          )}
        </div>

        <div className="space-y-4 mt-5">
          {lead.loanRequest && (
            <div className="flex items-end justify-between">
              <span className="text-2xl font-black text-foreground tracking-tighter group-hover:translate-x-1 transition-transform">
                ${(lead.loanRequest.amount / 1000).toFixed(0)}k
              </span>
              <Badge variant="outline" className="text-[8px] font-black bg-indigo-500/5 border-indigo-500/20 text-indigo-400 uppercase tracking-widest px-2 py-0.5">
                {lead.loanRequest.propertyType}
              </Badge>
            </div>
          )}

          <div className="flex items-center space-x-2 pt-1">
            <button className="p-2 rounded-xl bg-background/60 border border-border/40 text-muted-foreground hover:text-turquoise-400 hover:border-turquoise-500/30 transition-all shadow-inner">
              <Phone size={12} />
            </button>
            <button className="p-2 rounded-xl bg-background/60 border border-border/40 text-muted-foreground hover:text-indigo-400 hover:border-indigo-500/30 transition-all shadow-inner">
              <Mail size={12} />
            </button>
            <button className="flex-1 flex items-center justify-between p-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-500/20 px-4">
              <span className="text-[8px] font-black uppercase tracking-widest">Orchestrate</span>
              <ArrowRight size={10} />
            </button>
          </div>
        </div>

        <div className="mt-5 pt-4 border-t border-border/30 flex items-center justify-between text-[8px] font-black uppercase tracking-widest text-muted-foreground opacity-40">
          <div className="flex items-center gap-1.5">
             <Clock size={10} />
             <span>2D_AGO</span>
          </div>
          <div className="flex -space-x-1.5">
            <div className="size-4 rounded-full bg-indigo-500/20 border border-indigo-500/40" />
            <div className="size-4 rounded-full bg-turquoise-500/20 border border-turquoise-500/40" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
